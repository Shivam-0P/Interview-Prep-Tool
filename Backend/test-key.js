const dotenv = require('dotenv');
dotenv.config();

const token = process.env.WATSONX_ACCESS_TOKEN || process.env.ACCESS_TOKEN;
const apiKey = process.env.ApiKey || process.env.WATSONX_AI_APIKEY;
const projectId = process.env.WATSONX_PROJECT_ID;
const serviceUrl = process.env.WATSONX_AI_SERVICE_URL || 'https://us-south.ml.cloud.ibm.com';

console.log('\n========================================');
console.log('🔍 TESTING IBM WATSONX AUTH & PROJECT');
console.log('========================================');
console.log('Access Token    :', token ? `${token.slice(0, 12)}... (${token.length} chars)` : 'None');
console.log('API Key         :', apiKey ? `${apiKey.slice(0, 8)}... (${apiKey.length} chars)` : 'None');
console.log('Project ID      :', projectId || '❌ NOT FOUND');
console.log('Service URL     :', serviceUrl);
console.log('----------------------------------------\n');

if ((!token && !apiKey) || !projectId) {
  console.error('❌ Error: Missing WATSONX_ACCESS_TOKEN (or ApiKey) or WATSONX_PROJECT_ID in Backend/.env');
  process.exit(1);
}

(async () => {
  try {
    const { WatsonXAI } = await import('@ibm-cloud/watsonx-ai');
    const { BearerTokenAuthenticator, IamAuthenticator } = await import('ibm-cloud-sdk-core');

    const authenticator = token
      ? new BearerTokenAuthenticator({ bearerToken: token })
      : new IamAuthenticator({ apikey: apiKey });

    console.log(`⏳ Connecting to IBM Watsonx AI using ${token ? 'Bearer Token' : 'IAM API Key'}...`);

    const watsonx = new WatsonXAI({
      version: '2024-05-31',
      serviceUrl,
      authenticator
    });

    const response = await watsonx.textChat({
      modelId: 'ibm/granite-13b-chat-v2',
      projectId,
      messages: [{ role: 'user', content: 'Say hello in 5 words' }],
      maxTokens: 50,
    });

    const answer = response.result?.choices?.[0]?.message?.content;

    console.log('\n✅ SUCCESS! IBM Watsonx AI Authentication & Project ID are VALID!');
    console.log('🤖 IBM Watsonx AI Output:\n', answer);
    console.log('========================================\n');
  } catch (err) {
    console.error('\n❌ WATSONX TEST FAILED');
    const status = err?.status || err?.code || 'Error';
    const message = err?.message || err?.result?.errorMessage || err;
    console.error(`Status: ${status}`);
    console.error(`Message: ${message}\n`);
    console.log('========================================\n');
  }
})();
