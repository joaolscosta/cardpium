import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Browse.css";

const Browse = () => {
   const [decks, setDecks] = useState([]);
   const [selectedDeckId, setSelectedDeckId] = useState(null);
   const [flashcards, setFlashcards] = useState([]);
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

   const handleEnterDeck = async (deckId) => {
      setSelectedDeckId(deckId);
      setLoading(true);
      try {
         const response = await axios.get(`http://localhost:3001/flashcards?deckId=${deckId}`, {
            withCredentials: true,
         });
         setFlashcards(response.data);
      } catch (error) {
         console.error("Error fetching flashcards:", error);
      } finally {
         setLoading(false);
      }
   };

   const handleRemoveDeck = async (deckId) => {
      if (!window.confirm("Are you sure you want to delete this deck and all its flashcards?")) {
         return;
      }

      try {
         await axios.delete(`http://localhost:3001/decks/${deckId}`, { withCredentials: true });
         setDecks(decks.filter((deck) => deck.id !== deckId)); // Remove the deck from the list
         if (selectedDeckId === deckId) {
            setSelectedDeckId(null); // Reset selected deck if it was deleted
         }
      } catch (error) {
         console.error("Error deleting deck:", error);
         alert("Failed to delete the deck. Please try again.");
      }
   };

   if (loading) {
      return <p className="browse-loading">Loading...</p>;
   }

   if (!selectedDeckId) {
      return (
         <div className="browse-container">
            <h1 className="browse-title">Available Decks</h1>
            <ul className="browse-deck-list">
               {decks.map((deck) => (
                  <li key={deck.id} className="browse-deck-item">
                     <h3 className="deck-name">{deck.name}</h3>
                     <div className="deck-actions">
                        <button className="enter-button" onClick={() => handleEnterDeck(deck.id)}>
                           <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                        <button className="remove-button" onClick={() => handleRemoveDeck(deck.id)}>
                           <i class="fa-solid fa-trash"></i>
                        </button>
                     </div>
                  </li>
               ))}
            </ul>
         </div>
      );
   }

   return (
      <div className="browse-container">
         <h1 className="browse-title">Flashcards in Deck</h1>
         <button className="back-button" onClick={() => setSelectedDeckId(null)}>
            Back to Decks
         </button>
         <ul className="browse-flashcard-list">
            {flashcards.map((flashcard) => (
               <li key={flashcard.id} className="browse-flashcard-item">
                  <p>
                     <strong>Front:</strong> {flashcard.front}
                  </p>
                  <p>
                     <strong>Back:</strong> {flashcard.back}
                  </p>
               </li>
            ))}
         </ul>
      </div>
   );
};

export default Browse;
