import React, { useState } from "react";
import "../styles/AuthenticationPages.css";
import { Link } from "react-router-dom";
import axios from "axios";

function Register() {
   const [formData, setFormData] = useState({
      username: "",
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

   const handleSubmit = async (e) => {
      e.preventDefault();
      const { username, email, password } = formData;

      if (!username || !email || !password) {
         setErrorMessage("All fields are required. Please fill them out.");
         return;
      }

      setErrorMessage("");
      try {
         const response = await axios.post("http://localhost:3001/register", {
            username,
            email,
            password,
         });

         alert("User registered successfully!");
         // Clear
         setFormData({ username: "", email: "", password: "" });
      } catch (error) {
         console.error("Error during registration:", error);
         setErrorMessage(error.response?.data?.error || "An unexpected error occurred. Please try again.");
      }
   };

   return (
      <div className="register-page">
         <div className="register-left">
            <div className="logo-auth">
               <Link to={"/"}>
                  <h1>Cardpium.</h1>
               </Link>
            </div>
            <h1>Start and Grow Your Knowledge</h1>
            <p>
               Join Cardpium today and take the first step toward mastering anything. Learn faster, remember longer, and
               achieve your goals.
            </p>
         </div>
         <div className="register-right">
            <h2>Create an Account</h2>
            <button className="google-button">
               <i style={{ margin: "0 10px 0 0" }} className="fa-brands fa-google"></i>Continue with Google
            </button>
            <p className="divider">or</p>
            <form className="register-form" onSubmit={handleSubmit}>
               <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                     type="text"
                     id="username"
                     placeholder="Enter your username"
                     value={formData.username}
                     onChange={handleInputChange}
                  />
               </div>
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
