import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/MainPage.css";

function MainPage() {
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

   useEffect(() => {
      const checkAuth = async () => {
         try {
            const response = await axios.get("http://localhost:3001/auth-check", { withCredentials: true });
            if (response.status === 200) {
               setIsAuthenticated(true);
            }
         } catch (error) {
            console.error("Authentication check failed:", error);
            navigate("/login");
         } finally {
            setLoading(false);
         }
      };

      checkAuth();
   }, [navigate]);

   if (loading) {
      return <p>Loading...</p>;
   }

   if (!isAuthenticated) {
      return null; // Prevent rendering if not authenticated
   }

   return (
      <div className="main-page">
         <Sidebar />
         <div className="main-content">
            <h1>Welcome to the Main Page</h1>
            <p>This is the content area.</p>
         </div>
      </div>
   );
}

export default MainPage;
