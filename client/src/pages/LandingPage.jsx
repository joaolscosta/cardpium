import React from "react";
import "../styles/LandingPage.css";
import { Link } from "react-router-dom";

function LandingPage() {
   return (
      <div className="landing-page">
         <div className="topbar">
            <div className="logo">Cardpium.</div>
            <div className="auth-buttons">
               <Link to="/login">Login</Link>
               <p className="or">or</p>
               <Link to="/register">Register here!</Link>
            </div>
         </div>

         <div className="hero">
            <div className="hero-text">
               <h1>Master anything with Cardpium.</h1>
               <p>Your intelligent flashcard partner to learn faster and remember longer.</p>
               <Link to="/register" className="get-started-button">
                  Get Started for free!
               </Link>
            </div>
         </div>

         <footer>
            <div className="footer-content">
               <p>© 2025 Cardpium. All rights reserved.</p>
               <div className="social-icons">
                  <a href="https://github.com/joaolscosta" target="_blank" rel="noopener noreferrer">
                     GitHub
                  </a>
                  <a
                     href="https://www.linkedin.com/in/jo%C3%A3o-costa-876a14253/"
                     target="_blank"
                     rel="noopener noreferrer">
                     LinkedIn
                  </a>
               </div>
            </div>
         </footer>
      </div>
   );
}

export default LandingPage;
