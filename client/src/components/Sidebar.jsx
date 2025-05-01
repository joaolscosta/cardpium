import React, { useState, useEffect } from "react";
import "../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ setSelectedFeature, selectedFeature }) => {
   const [isOpen, setIsOpen] = useState(true);
   const [user, setUser] = useState({ name: "", email: "" });
   const navigate = useNavigate();
   const [logoutDialog, setLogoutDialog] = useState(false);

   useEffect(() => {
      // Fetch the logged-in user's information
      const fetchUser = async () => {
         try {
            const response = await axios.get("http://localhost:3001/user", { withCredentials: true });
            setUser({ name: response.data.username, email: response.data.email });
         } catch (error) {
            console.error("Error fetching user data:", error);
            // Catch in case of user trying to access the page without being logged in
            if (error.response && error.response.status === 401) {
               navigate("/login");
            }
         }
      };

      fetchUser();
   }, [navigate]);

   const handleNavigate = (feature) => {
      setSelectedFeature(feature);
   };

   const handleToggleSidebar = () => {
      setIsOpen(!isOpen);
   };

   const isSelected = (feature) => selectedFeature === feature;

   const handleLogout = async () => {
      try {
         await axios.post("http://localhost:3001/logout", {}, { withCredentials: true });
         window.location.href = "/login";
      } catch (error) {
         console.error("Error logging out:", error);
         alert("Failed to log out. Please try again.");
      }
   };

   return (
      <>
         {!isOpen && (
            <button className="open-button" onClick={handleToggleSidebar}>
               <i className="fa-solid fa-bars"></i>
            </button>
         )}

         {isOpen && (
            <div className="sidebar">
               <div className="sidebar-content">
                  <div className="sidebar-header">
                     <h1 className="sidebar-logo" onClick={() => handleNavigate("Dashboard")}>
                        Cardpium.
                     </h1>
                     <button className="close-button" onClick={handleToggleSidebar}>
                        <i className="fa-solid fa-arrow-left"></i>
                     </button>
                  </div>
                  <div className="sidebar-features">
                     <div
                        className={`sidebar-feature ${isSelected("Dashboard") ? "selected" : ""}`}
                        onClick={() => handleNavigate("Dashboard")}>
                        <i className="fa-solid fa-house"></i>
                        <span>Dashboard</span>
                     </div>
                     <div
                        className={`sidebar-feature ${isSelected("Create") ? "selected" : ""}`}
                        onClick={() => handleNavigate("Create")}>
                        <i className="fa-solid fa-plus"></i>
                        <span>Create</span>
                     </div>
                     <div
                        className={`sidebar-feature ${isSelected("Library") ? "selected" : ""}`}
                        onClick={() => handleNavigate("Library")}>
                        <i className="fa-solid fa-folder"></i>
                        <span>Library</span>
                     </div>
                     <div
                        className={`sidebar-feature ${isSelected("Settings") ? "selected" : ""}`}
                        onClick={() => handleNavigate("Settings")}>
                        <i className="fa-solid fa-cog"></i>
                        <span>Settings</span>
                     </div>
                     <div
                        className={`sidebar-feature ${isSelected("Logout") ? "selected" : ""}`}
                        onClick={() => setLogoutDialog(true)}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>Logout</span>
                     </div>
                  </div>
               </div>

               {logoutDialog && (
                  <div className="logout-dialog-overlay">
                     <div className="logout-dialog">
                        <h2>Confirm Logout</h2>
                        <p>Are you sure you want to log out?</p>
                        <div className="dialog-actions">
                           <button className="confirm-button" onClick={handleLogout}>
                              Yes, Logout
                           </button>
                           <button className="cancel-button" onClick={() => setLogoutDialog(false)}>
                              Cancel
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               <div className="sidebar-user">
                  <div className="user-avatar">{user.name[0]}</div>
                  <div className="user-info">
                     <span className="user-name">{user.name}</span>
                     <span className="user-email">{user.email}</span>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};

export default Sidebar;
