import React, { useState } from "react";
import "../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
   const [isOpen, setIsOpen] = useState(true);
   const navigate = useNavigate();

   const handleNavigateHome = () => {
      navigate("/home");
   };

   const handleToggleSidebar = () => {
      setIsOpen(!isOpen);
   };

   return (
      <>
         {!isOpen && (
            <button className="open-button" onClick={handleToggleSidebar}>
               <i class="fa-solid fa-bars"></i>
            </button>
         )}

         {isOpen && (
            <div className="sidebar">
               <div className="sidebar-content">
                  <div className="sidebar-header">
                     <h1 className="sidebar-logo" onClick={handleNavigateHome}>
                        Cardpium.
                     </h1>
                     <button className="close-button" onClick={handleToggleSidebar}>
                        <i class="fa-solid fa-arrow-left"></i>
                     </button>
                  </div>
                  <div className="sidebar-features">
                     <div className="sidebar-feature" onClick={handleNavigateHome}>
                        <i class="fa-solid fa-house"></i>
                        <span>Dashboard</span>
                     </div>
                     <div className="sidebar-feature">
                        <i class="fa-solid fa-plus"></i>
                        <span>Create</span>
                     </div>
                     <div className="sidebar-feature">
                        <i class="fa-solid fa-folder"></i>
                        <span>Browse</span>
                     </div>
                     <div className="sidebar-feature">
                        <i class="fa-solid fa-cog"></i>
                        <span>Settings</span>
                     </div>
                     <div className="sidebar-feature">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>Logout</span>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};

export default Sidebar;
