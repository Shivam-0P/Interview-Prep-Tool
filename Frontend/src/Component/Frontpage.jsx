import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '../Style/Frontpage.css'
import logoImage from '../Images/image.png'
import heroImage from '../Images/Gemini_Generated_Image_svleiysvleiysvle.png'

const Frontpage = () => {
	const [isDarkTheme, setIsDarkTheme] = useState(() => {
		return localStorage.getItem('prepwise-theme') === 'dark'
	})

	useEffect(() => {
		localStorage.setItem('prepwise-theme', isDarkTheme ? 'dark' : 'light')
	}, [isDarkTheme])

	return (
		<div>
			<div className={`main-container${isDarkTheme ? ' dark-theme' : ''}`} id="home">
				<section className='nav-bar-section'>
					<nav className='nav-bar'>
						<div className="logo">
							<img src={logoImage} alt="Prepwise logo" />
						</div>
						<div className="nav-links">
							<ul className='Links'>
								<li className='home-link'>
									<a href="#home">Home</a>
									</li>
								<li className='about-link'>
									<a href="#about">About</a>
									</li>
								<li className='register-link'>
									<Link to="/register">Register</Link>
									</li>
								<li className='Login-link'>
									<Link to="/login">Login</Link>
									</li>
							</ul>
						</div>
						<button
							className="theme-toggle"
							type="button"
							onClick={() => setIsDarkTheme((currentTheme) => !currentTheme)}
							aria-label={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
							title={isDarkTheme ? 'Light theme' : 'Dark theme'}
						>
							{isDarkTheme ? '☀' : '☾'}
						</button>
					</nav>
				</section>
				<div className="details-container">
					<div className="details-section">
						<div className='frontpage-para'>
							<h2>AI-Powered Study &amp; Interview Prep Tool</h2>
							<p>An AI-powered full-stack MERN application designed to help students and job seekers prepare for exams and technical interviews more effectively. Users can upload notes or documents, and the application analyzes the content to generate personalized study and interview questions using AI.</p>
						</div>
						<img className="frontpage-image" src={heroImage} alt="Student preparing for an interview" />
					</div>
				</div>
				<section className="about-section" id="about">
					<div className="about-content">
						<p className="about-eyebrow">ABOUT PREPWISE</p>
						<h2>Better preparation starts with <em>a clearer path.</em></h2>
						<p className="about-description">Prepwise helps students and job seekers turn their own study material into focused practice. Instead of guessing what to revise next, you get a learning experience built around your goals.</p>
						<Link className="about-button" to="/register">Begin your journey <span>→</span></Link>
					</div>
					<div className="about-points">
						<article><span className="about-icon">01</span><div><h3>Built around your material</h3><p>Use your notes and documents as the starting point for every practice session.</p></div></article>
						<article><span className="about-icon">02</span><div><h3>Designed for real progress</h3><p>Spot gaps early, learn from feedback, and focus your effort where it counts.</p></div></article>
						<article><span className="about-icon">03</span><div><h3>Ready for what’s next</h3><p>Prepare with more confidence for exams, interviews, and new opportunities.</p></div></article>
					</div>
				</section>
			</div>
		</div>
	)
}

export default Frontpage
