import React from "react";

function LandingPage() {
   return (
      <>
         <div className="landing-page">
            <div className="topbar">
               <div className="logo">Cardpium.</div>
               <div className="auth-buttons">
                  <a href="login">Login</a>
                  <p className="or">or</p>
                  <a href="register">Register</a>
               </div>
            </div>

            <div className="hero">
               <div className="hero-text">
                  <h1>Master anything with Cardpium.</h1>
                  <p>Your intelligent flashcard partner to learn faster and remember longer.</p>
                  <a href="register" className="get-started-button">
                     Get Started for free!
                  </a>
               </div>
            </div>

            <footer>
               <div className="footer-content">
                  <p>© 2023 Cardpium. All rights reserved.</p>
                  <div className="social-icons">
                     <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                        GitHub
                     </a>
                     <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                        LinkedIn
                     </a>
                  </div>
               </div>
            </footer>
         </div>
      </>
   );
}

export default LandingPage;
