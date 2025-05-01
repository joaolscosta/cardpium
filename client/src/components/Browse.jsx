import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Browse.css";

const Browse = () => {
   const [decks, setDecks] = useState([]);
   const [selectedDeckId, setSelectedDeckId] = useState(null);
   const [flashcards, setFlashcards] = useState([]);
   const [loading, setLoading] = useState(true);
   const [editDialog, setEditDialog] = useState({ isOpen: false, flashcard: null });

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

   const handleRemoveFlashcard = async (flashcardId) => {
      if (!window.confirm("Are you sure you want to delete this flashcard?")) {
         return;
      }

      try {
         await axios.delete(`http://localhost:3001/flashcards/${flashcardId}`, { withCredentials: true });
         setFlashcards(flashcards.filter((flashcard) => flashcard.id !== flashcardId));
      } catch (error) {
         console.error("Error deleting flashcard:", error);
         alert("Failed to delete the flashcard. Please try again."); // TODO - Switch to dialog
      }
   };

   const handleOpenEditDialog = (flashcard) => {
      setEditDialog({ isOpen: true, flashcard });
   };

   const handleCloseEditDialog = () => {
      setEditDialog({ isOpen: false, flashcard: null });
   };

   const handleEditFlashcard = async () => {
      const { id, front, back } = editDialog.flashcard;

      if (!front || !back) {
         alert("Both front and back text are required."); // TODO - Switch to dialog
         return;
      }

      try {
         await axios.put(`http://localhost:3001/flashcards/${id}`, { front, back }, { withCredentials: true });
         setFlashcards(
            flashcards.map((flashcard) => (flashcard.id === id ? { ...flashcard, front, back } : flashcard))
         );
         handleCloseEditDialog();
      } catch (error) {
         console.error("Error editing flashcard:", error);
         alert("Failed to edit the flashcard. Please try again."); // TODO - Switch to dialog
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
                           Enter
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
                  <div className="flashcard-texts">
                     <p>
                        <strong>Front:</strong> {flashcard.front}
                     </p>
                     <p>
                        <strong>Back:</strong> {flashcard.back}
                     </p>
                  </div>
                  <div className="flashcard-actions">
                     <button className="customize-button" onClick={() => handleOpenEditDialog(flashcard)}>
                        Edit
                     </button>
                     <button className="remove-button" onClick={() => handleRemoveFlashcard(flashcard.id)}>
                        Remove
                     </button>
                  </div>
               </li>
            ))}
         </ul>

         {editDialog.isOpen && (
            <div className="edit-dialog">
               <h2>Edit Flashcard</h2>
               <label>
                  Front:
                  <input
                     type="text"
                     value={editDialog.flashcard.front}
                     onChange={(e) =>
                        setEditDialog({
                           ...editDialog,
                           flashcard: { ...editDialog.flashcard, front: e.target.value },
                        })
                     }
                  />
               </label>
               <label>
                  Back:
                  <input
                     type="text"
                     value={editDialog.flashcard.back}
                     onChange={(e) =>
                        setEditDialog({
                           ...editDialog,
                           flashcard: { ...editDialog.flashcard, back: e.target.value },
                        })
                     }
                  />
               </label>
               <button onClick={handleEditFlashcard}>Save</button>
               <button onClick={handleCloseEditDialog}>Cancel</button>
            </div>
         )}
      </div>
   );
};

export default Browse;
