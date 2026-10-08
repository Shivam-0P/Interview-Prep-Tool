const User = require("../Models/Usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SEC, { expiresIn: "7d" });

let cachedToken = null, tokenExpiresAt = 0;

async function getIamAccessToken(forceRefresh = false) {
  const apiKey = (process.env.WATSONX_API_KEY || process.env.WATSONX_AI_APIKEY || process.env.ApiKey || "").trim();
  if (!apiKey) throw new Error("WATSONX_API_KEY is missing in backend environment.");

  if (!forceRefresh && cachedToken && Date.now() < tokenExpiresAt - 120000) return cachedToken;

  const res = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ibm:params:oauth:grant-type:apikey", apikey: apiKey })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const err = new Error(errData.errorMessage || errData.message || `IAM token exchange failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

const registeruser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "Username, email, and password are required" });

    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email: normalizedEmail, password: hashedPassword });
    res.cookie("token", createToken(newUser._id), { httpOnly: true, sameSite: "lax" });

    return res.status(201).json({
      message: "User registered successfully",
      user: { _id: newUser._id, email: newUser.email, username: newUser.username }
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to register user" });
  }
};

const loginuser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Email or password is incorrect" });

    res.cookie("token", createToken(user._id), { httpOnly: true, sameSite: "lax" });
    return res.status(200).json({
      message: "User logged in successfully",
      user: { _id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to log in" });
  }
};

const askPrepQuestion = async (req, res) => {
  try {
    const { prompt, fileContent, fileName } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ message: "Prompt is required" });

    const projectId = (process.env.WATSONX_PROJECT_ID || process.env.PROJECT_ID || "").trim();
    if (!projectId) return res.status(500).json({ message: "WATSONX_PROJECT_ID is missing in backend environment." });

    const watsonxUrl = (process.env.WATSONX_URL || process.env.WATSONX_AI_SERVICE_URL || "https://us-south.ml.cloud.ibm.com").trim().replace(/\/$/, "");
    const modelId = (process.env.WATSONX_MODEL_ID || "meta-llama/llama-3-3-70b-instruct").trim();

    let fullInput = `User: ${prompt.trim()}`;
    if (fileContent && typeof fileContent === "string") fullInput += `\n\n[Attached File: ${fileName || "document"}]:\n${fileContent.slice(0, 5000)}`;
    fullInput += `\n\nAssistant:`;

    const callWatsonx = async (isRetry = false) => {
      const accessToken = await getIamAccessToken(isRetry);
      const response = await fetch(`${watsonxUrl}/ml/v1/text/generation?version=2024-05-31`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          model_id: modelId,
          project_id: projectId,
          input: fullInput,
          parameters: { max_new_tokens: 200, decoding_method: "greedy" }
        })
      });

      if (!response.ok) {
        if ((response.status === 401 || response.status === 403) && !isRetry) {
          cachedToken = null;
          return callWatsonx(true);
        }
        const errJson = await response.json().catch(() => ({}));
        const err = new Error(errJson.message || errJson.error?.message || errJson.errors?.[0]?.message || `watsonx.ai request failed (${response.status})`);
        err.status = response.status;
        throw err;
      }

      const resData = await response.json();
      return resData.results?.[0]?.generated_text || resData.choices?.[0]?.message?.content;
    };

    const answer = await callWatsonx();
    if (!answer) return res.status(502).json({ message: "No response generated by watsonx.ai" });

    return res.status(200).json({ answer: answer.trim() });
  } catch (error) {
    console.error("watsonx.ai error:", error.message || error);
    const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 500;
    return res.status(status).json({ message: error.message || "Failed to get answer from watsonx.ai" });
  }
};

module.exports = { registeruser, loginuser, askPrepQuestion };
