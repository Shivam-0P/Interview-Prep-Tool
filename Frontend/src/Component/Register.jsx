import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Style/Register.css';

const Register = () => {
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			await axios.post('http://localhost:4000/register', { username, password, email }, { withCredentials: true });
			setUsername('');
			setEmail('');
			setPassword('');
			navigate('/login');
		} catch (error) {
			alert(error.response?.data?.message || 'Unable to register');
		}
	};

	return (
		<div className="main_container">
			<div className="card-section">
				<section className="Name-section"><p>REGISTER HERE</p></section>
				<section className="user-details-section">
					<form onSubmit={handleSubmit}>
						<div className="username-div">
							<label htmlFor="username">USERNAME</label>
							<input type="text" id="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
						</div>
						<div className="email-div">
							<label htmlFor="email-id">Email-ID</label>
							<input type="email" id="email-id" value={email} onChange={(event) => setEmail(event.target.value)} required />
						</div>
						<div className="password-div">
							<label htmlFor="password">Password</label>
							<input type="password" id="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
						</div>
						<button type="submit">Register</button>
						<p className="auth-switch">Already have an account?<Link className="auth-link" to="/login">Login</Link></p>
					</form>
				</section>
			</div>
		</div>
	);
};

export default Register;
