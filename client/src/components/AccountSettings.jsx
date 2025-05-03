import React, { useState } from "react";
import "../styles/AccountSettings.css";

const AccountSettings = () => {
   const [newUsername, setNewUsername] = useState("");
   const [currentPassword, setCurrentPassword] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [message, setMessage] = useState("");

   const [showUsernameDialog, setShowUsernameDialog] = useState(false);
   const [showPasswordDialog, setShowPasswordDialog] = useState(false);
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
         .then((data) => {
            setMessage(data.message || data.error);
            setShowUsernameDialog(false);
         })
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
         .then((data) => {
            setMessage(data.message || data.error);
            setShowPasswordDialog(false);
         })
         .catch((error) => console.error("Error updating password:", error));
   };

   const handleDeleteAccount = () => {
      fetch("http://localhost:3001/user", {
         method: "DELETE",
         credentials: "include",
      })
         .then((response) => response.json())
         .then((data) => {
            setMessage(data.message || data.error);
            setShowDeleteDialog(false);
         })
         .catch((error) => console.error("Error deleting account:", error));
   };

   return (
      <div className="account-settings-container">
         <h1 className="account-settings-title">Account Settings</h1>
         {message && <p className={`message ${message.includes("successfully") ? "success" : "error"}`}>{message}</p>}

         <div className="account-settings-section">
            <h2>Update Username</h2>
            <div className="input-button-group">
               <input
                  type="text"
                  placeholder="New Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
               />
               <button onClick={() => setShowUsernameDialog(true)}>Update</button>
            </div>
         </div>

         <div className="account-settings-section">
            <h2>Update Password</h2>
            <div className="input-button-group">
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
               <button onClick={() => setShowPasswordDialog(true)}>Update Password</button>
            </div>
         </div>

         <div className="account-settings-section">
            <h2>Delete Account</h2>
            <p className="delete-account-warning">
               Deleting your account is permanent and cannot be undone. Please proceed with caution.
            </p>
            <button className="delete-account-button" onClick={() => setShowDeleteDialog(true)}>
               Delete Account
            </button>
         </div>

         {showUsernameDialog && (
            <div className="dialog-overlay">
               <div className="dialog">
                  <p>Are you sure you want to update your username?</p>
                  <button onClick={handleUpdateUsername}>Yes</button>
                  <button onClick={() => setShowUsernameDialog(false)}>Cancel</button>
               </div>
            </div>
         )}

         {showPasswordDialog && (
            <div className="dialog-overlay">
               <div className="dialog">
                  <p>Are you sure you want to update your password?</p>
                  <button onClick={handleUpdatePassword}>Yes</button>
                  <button onClick={() => setShowPasswordDialog(false)}>Cancel</button>
               </div>
            </div>
         )}

         {showDeleteDialog && (
            <div className="dialog-overlay">
               <div className="dialog">
                  <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                  <button onClick={handleDeleteAccount}>Yes</button>
                  <button onClick={() => setShowDeleteDialog(false)}>Cancel</button>
               </div>
            </div>
         )}
      </div>
   );
};

export default AccountSettings;
