import React from "react";
import "../styles/AuthenticationPages.css";
import { Link } from "react-router-dom";

function LoginPage() {
   return (
      <div className="register-page">
         <div className="register-left">
            <h1>Welcome Back!</h1>
            <p>
               Log in to continue your journey with Cardpium. Pick up where you left off and keep mastering your
               knowledge.
            </p>
         </div>
         <div className="register-right">
            <h2>Log In to Your Account</h2>
            <button className="google-button">Continue with Google</button>
            <p className="divider">or</p>
            <form className="register-form">
               <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" placeholder="Enter your email" />
               </div>
               <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input type="password" id="password" placeholder="Enter your password" />
               </div>
               <button type="submit" className="submit-button">
                  Log In
               </button>
            </form>
            <p className="no-account">
               Don't have an account?{" "}
               <Link to="/register" className="register-link">
                  Create one here!
               </Link>
            </p>
         </div>
      </div>
   );
}

export default LoginPage;
