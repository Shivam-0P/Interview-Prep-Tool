import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Style/Login.css';

const Login = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);
		try {
			await axios.post('http://localhost:4000/login', { email, password }, { withCredentials: true });
			setEmail('');
			setPassword('');
			navigate('/prep');
		} catch (error) {
			alert(error.response?.data?.message || 'Unable to log in');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="login-container">
			<div className="login-card-container">
				<section className="login-name"><p className="login-para">Login</p></section>
				<form className="Login-form" onSubmit={handleSubmit}>
					<div className="login-email">
						<label htmlFor="email">Email</label>
						<input type="email" id="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
					</div>
					<div className="login-password">
						<label htmlFor="password">Password</label>
						<input type="password" id="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
					</div>
					<p className="auth-switch">Don’t have an account?<Link className="auth-link" to="/register">Register</Link></p>
					<button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
						{isSubmitting ? <><span className="button-spinner" aria-hidden="true" />Logging in…</> : 'Login'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
