import React from "react";
import "../styles/AuthenticationPages.css";
import { Link } from "react-router-dom";

function Register() {
   return (
      <div className="register-page">
         <div className="register-left">
            <h1>Start and Grow Your Knowledge</h1>
            <p>
               Join Cardpium today and take the first step toward mastering anything. Learn faster, remember longer, and
               achieve your goals.
            </p>
         </div>
         <div className="register-right">
            <h2>Create an Account</h2>
            <button className="google-button">Continue with Google</button>
            <p className="divider">or</p>
            <form className="register-form">
               <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input type="text" id="username" placeholder="Enter your username" />
               </div>
               <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" placeholder="Enter your email" />
               </div>
               <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input type="password" id="password" placeholder="Enter your password" />
               </div>
               <button type="submit" className="submit-button">
                  Create Account
               </button>
            </form>
            <p className="no-account">
               Already have an account?{" "}
               <Link to="/login" className="register-link">
                  Login here!
               </Link>
            </p>
         </div>
      </div>
   );
}

export default Register;
