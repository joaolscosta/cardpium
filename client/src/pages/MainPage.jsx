import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import Library from "../components/Library";
import Create from "../components/Create";
import Settings from "../components/Settings";
import StudyDeck from "../components/StudyDeck";
import "../styles/MainPage.css";

function MainPage() {
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [loading, setLoading] = useState(true);
   const [selectedFeature, setSelectedFeature] = useState("Dashboard");
   const [studyDeckId, setStudyDeckId] = useState(null);
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
      return <p className="loading">Loading...</p>;
   }

   if (!isAuthenticated) {
      return null;
   }

   const renderContent = () => {
      switch (selectedFeature) {
         case "Dashboard":
            return (
               <Dashboard
                  setStudyDeckId={(deckId) => {
                     setStudyDeckId(deckId);
                     setSelectedFeature("StudyDeck");
                  }}
                  setSelectedFeature={setSelectedFeature}
               />
            );
         case "Library":
            return <Library setSelectedFeature={setSelectedFeature} />;
         case "Create":
            return <Create />;
         case "Settings":
            return <Settings />;
         case "StudyDeck":
            return (
               <StudyDeck
                  deckId={studyDeckId}
                  setStudyDeckId={(deckId) => {
                     setStudyDeckId(null);
                     setSelectedFeature("Dashboard");
                  }}
               />
            );
         case "Logout":
            return;
         default:
            return <h1>404 - Not Found</h1>;
      }
   };

   return (
      <div className="main-page">
         <Sidebar setSelectedFeature={setSelectedFeature} selectedFeature={selectedFeature} />
         <div className="main-content">{renderContent()}</div>
      </div>
   );
}

export default MainPage;
