import { useRef, useState } from 'react'
import axios from 'axios'
import '../Style/prep.css'

const Preppage = () => {
	const [message, setMessage] = useState('')
	const [selectedFile, setSelectedFile] = useState(null)
	const [submittedQuestion, setSubmittedQuestion] = useState('')
	const [submittedFileName, setSubmittedFileName] = useState('')
	const [answer, setAnswer] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const fileInputRef = useRef(null)

	const handleSubmit = async (event) => {
		event.preventDefault();
		if ((!message.trim() && !selectedFile) || isLoading) {
			return;
		}

		setError('');
		setAnswer('');
		setIsLoading(true);

		const currentPrompt = message.trim();
		const currentFile = selectedFile;

		// Clear input bar and attached file immediately after click
		setMessage('');
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}

		try {
			let fileContent = null;
			let fileName = null;

			if (currentFile) {
				fileName = currentFile.name;
				try {
					const rawText = await currentFile.text();
					fileContent = rawText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
				} catch (err) {
					console.warn('Could not read file text:', err);
				}
			}

			const promptText = currentPrompt || `Analyze the attached file (${fileName}) and provide key interview questions and answers.`;

			// Save to display in Question area
			setSubmittedQuestion(currentPrompt || `Analyze document: ${fileName}`);
			setSubmittedFileName(fileName || '');

			const response = await axios.post('http://localhost:4000/prep/ask', {
				prompt: promptText,
				fileContent,
				fileName,
			});

			setAnswer(response.data?.answer || 'No answer received.');
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Unable to get response from AI right now.');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<main className="prep-page">
			<section className="prep-shell" aria-labelledby="prep-title">
				<p className="prep-label">PREPWISE AI</p>
				<h1 id="prep-title">What would you like to prepare for?</h1>
				<p className="prep-subtitle">Ask a question, paste your topic, or attach notes to create a personalized study session.</p>

				<form className="ai-composer" onSubmit={handleSubmit}>
					{selectedFile && (
						<div className="file-chip">
							<span className="file-icon">⌁</span>
							<span>{selectedFile.name}</span>
							<button type="button" onClick={() => setSelectedFile(null)} aria-label="Remove attached file">×</button>
						</div>
					)}
					<div className="composer-row">
						<input
							ref={fileInputRef}
							className="file-input"
							type="file"
							accept=".pdf,.doc,.docx,.txt,.md,.json,.csv"
							onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
						/>
						<button className="attach-button" type="button" onClick={() => fileInputRef.current?.click()} aria-label="Upload notes or a document" title="Upload notes or a document">+</button>
						<input className="prompt-input" type="text" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask anything or upload your notes..." aria-label="Study prompt" />
						<button className="send-button" type="submit" aria-label="Send prompt" disabled={(!message.trim() && !selectedFile) || isLoading}>{isLoading ? '...' : '↑'}</button>
					</div>
					<p className="composer-hint">Attach PDF, DOCX, TXT, or MD files · AI can make mistakes. Check important information.</p>
				</form>

				{error && <p className="prep-feedback prep-error">{error}</p>}

				{submittedQuestion && (
					<section className="prep-question" aria-live="polite">
						<h2>Your Question</h2>
						<p>{submittedQuestion}</p>
						{submittedFileName && <span className="attached-badge">📎 {submittedFileName}</span>}
					</section>
				)}

				{answer && (
					<section className="prep-answer" aria-live="polite">
						<h2>AI Answer</h2>
						<p>{answer}</p>
					</section>
				)}
			</section>
		</main>
	)
}

export default Preppage
