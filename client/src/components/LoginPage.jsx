import React, { useState } from "react";
import "../styles/AuthenticationPages.css";
import { Link } from "react-router-dom";

function LoginPage() {
   const [formData, setFormData] = useState({
      email: "",
      password: "",
   });
   const [errorMessage, setErrorMessage] = useState("");

   const handleInputChange = (e) => {
      const { id, value } = e.target;
      setFormData((prevData) => ({
         ...prevData,
         [id]: value,
      }));
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      const { email, password } = formData;

      if (!email || !password) {
         setErrorMessage("All fields are required. Please fill them out.");
         return;
      }

      // Clear
      setErrorMessage("");
      // TODO - API call to log in the user
   };

   return (
      <div className="register-page">
         <div className="register-left">
            <div className="logo-auth">
               <Link to={"/"}>
                  <h1>Cardpium.</h1>
               </Link>
            </div>
            <h1>Welcome Back!</h1>
            <p>
               Log in to continue your journey with Cardpium. Pick up where you left off and keep mastering your
               knowledge.
            </p>
         </div>
         <div className="register-right">
            <h2>Log In to Your Account</h2>
            <button className="google-button">
               <i style={{ margin: "0 10px 0 0" }} class="fa-brands fa-google"></i>Continue with Google
            </button>
            <p className="divider">or</p>
            <form className="register-form" onSubmit={handleSubmit}>
               <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                     type="email"
                     id="email"
                     placeholder="Enter your email"
                     value={formData.email}
                     onChange={handleInputChange}
                  />
               </div>
               <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                     type="password"
                     id="password"
                     placeholder="Enter your password"
                     value={formData.password}
                     onChange={handleInputChange}
                  />
               </div>
               {errorMessage && <p className="error-message">{errorMessage}</p>}
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
