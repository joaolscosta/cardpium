import React, { useState } from "react";

const AccountSettings = () => {
   const [newUsername, setNewUsername] = useState("");
   const [currentPassword, setCurrentPassword] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [message, setMessage] = useState("");

   const handleUpdateUsername = () => {
      fetch("http://localhost:3001/user/username", {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
         body: JSON.stringify({ newUsername }),
      })
         .then((response) => response.json())
         .then((data) => setMessage(data.message || data.error))
         .catch((error) => console.error("Error updating username:", error));
   };

   const handleUpdatePassword = () => {
      fetch("http://localhost:3001/user/password", {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
         body: JSON.stringify({ currentPassword, newPassword }),
      })
         .then((response) => response.json())
         .then((data) => setMessage(data.message || data.error))
         .catch((error) => console.error("Error updating password:", error));
   };

   const handleDeleteAccount = () => {
      if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
         fetch("http://localhost:3001/user", {
            method: "DELETE",
            credentials: "include",
         })
            .then((response) => response.json())
            .then((data) => setMessage(data.message || data.error))
            .catch((error) => console.error("Error deleting account:", error));
      }
   };

   return (
      <div>
         <h1>Account Settings</h1>
         {message && <p>{message}</p>}

         <div>
            <h2>Update Username</h2>
            <input
               type="text"
               placeholder="New Username"
               value={newUsername}
               onChange={(e) => setNewUsername(e.target.value)}
            />
            <button onClick={handleUpdateUsername}>Update Username</button>
         </div>

         <div>
            <h2>Update Password</h2>
            <input
               type="password"
               placeholder="Current Password"
               value={currentPassword}
               onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
               type="password"
               placeholder="New Password"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={handleUpdatePassword}>Update Password</button>
         </div>

         <div>
            <h2>Delete Account</h2>
            <button onClick={handleDeleteAccount} style={{ color: "red" }}>
               Delete Account
            </button>
         </div>
      </div>
   );
};

export default AccountSettings;
