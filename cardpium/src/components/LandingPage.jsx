import React from "react";

function LandingPage() {
   return (
      <>
         {/* Topbar */}
         <header className="topbar">
            <div className="container">
               <h1 className="logo">Cardpium</h1>
               <nav>
                  <ul className="nav-links">
                     <li>
                        <a href="#about">About</a>
                     </li>
                  </ul>
               </nav>
            </div>
         </header>

         {/* Landing Page Content */}
         <main className="landing">
            <section className="hero">
               <h1>Welcome to Cardpium</h1>
               <p>Your ultimate solution for managing cards efficiently.</p>
               <button className="cta-button">Get Started</button>
            </section>
         </main>

         {/* Footer */}
         <footer className="footer">
            <div className="container">
               <p>&copy; 2025 Cardpium. All rights reserved.</p>
               <section id="contact">
                  <h2>Contact Us</h2>
                  <p>
                     Have questions? Reach out to us at <a href="mailto:support@cardpium.com">support@cardpium.com</a>.
                  </p>
               </section>
            </div>
         </footer>
      </>
   );
}

export default LandingPage;
