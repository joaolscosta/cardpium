import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

const Dashboard = ({ setStudyDeckId }) => {
   const [decks, setDecks] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchDecks = async () => {
         try {
            const response = await axios.get("http://localhost:3001/decks", { withCredentials: true });
            setDecks(response.data);
         } catch (error) {
            console.error("Error fetching decks:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchDecks();
   }, []);

   if (loading) {
      return <p className="dashboard-loading">Loading decks...</p>;
   }

   if (decks.length === 0) {
      return (
         <div>
            <h1 className="dashboard-title">Your Decks</h1>
            <p className="dashboard-empty">No decks available. Create one to get started!</p>
         </div>
      );
   }

   return (
      <div>
         <h1 className="dashboard-title">Your Decks</h1>
         <ul className="dashboard-deck-list">
            {decks.map((deck) => (
               <li key={deck.id} className="dashboard-deck-item">
                  <h3 className="deck-name">{deck.name}</h3>
                  <button className="study-button" onClick={() => setStudyDeckId(deck.id)}>
                     Study
                  </button>
               </li>
            ))}
         </ul>
      </div>
   );
};

export default Dashboard;
