import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Library.css";

const Library = ({ setSelectedFeature }) => {
   const [decks, setDecks] = useState([]);
   const [selectedDeckId, setSelectedDeckId] = useState(null);
   const [flashcards, setFlashcards] = useState([]);
   const [loading, setLoading] = useState(true);
   const [editDialog, setEditDialog] = useState({ isOpen: false, flashcard: null });
   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, deckId: null });
   const [deleteFlashcardDialog, setDeleteFlashcardDialog] = useState({ isOpen: false, flashcardId: null });

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

   const handleRemoveDeck = async () => {
      const { deckId } = deleteDialog;
      try {
         await axios.delete(`http://localhost:3001/decks/${deckId}`, { withCredentials: true });
         setDecks(decks.filter((deck) => deck.id !== deckId));
         handleCloseDeleteDialog();
      } catch (error) {
         console.error("Error deleting deck:", error);
         alert("Failed to delete the deck. Please try again.");
      }
   };

   const handleRemoveFlashcard = async () => {
      const { flashcardId } = deleteFlashcardDialog;
      try {
         await axios.delete(`http://localhost:3001/flashcards/${flashcardId}`, { withCredentials: true });
         setFlashcards(flashcards.filter((flashcard) => flashcard.id !== flashcardId));
         handleCloseDeleteFlashcardDialog();
      } catch (error) {
         console.error("Error deleting flashcard:", error);
         alert("Failed to delete the flashcard. Please try again.");
      }
   };

   const handleOpenEditDialog = (flashcard) => {
      setEditDialog({ isOpen: true, flashcard });
   };

   const handleCloseEditDialog = () => {
      setEditDialog({ isOpen: false, flashcard: null });
   };

   const handleOpenDeleteDialog = (deckId) => {
      setDeleteDialog({ isOpen: true, deckId });
   };

   const handleCloseDeleteDialog = () => {
      setDeleteDialog({ isOpen: false, deckId: null });
   };

   const handleOpenDeleteFlashcardDialog = (flashcardId) => {
      setDeleteFlashcardDialog({ isOpen: true, flashcardId });
   };

   const handleCloseDeleteFlashcardDialog = () => {
      setDeleteFlashcardDialog({ isOpen: false, flashcardId: null });
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

   if (decks.length === 0) {
      return (
         <div>
            <h1 className="dashboard-title">Your Decks</h1>
            <div className="dashboard-empty-container">
               <p className="dashboard-empty">No decks available. Create one to get started!</p>
               <button className="create-deck-button" onClick={() => setSelectedFeature("Create")}>
                  Create Deck
               </button>
            </div>
         </div>
      );
   }

   if (!selectedDeckId) {
      return (
         <div className="browse-container">
            <h1 className="browse-title">Library</h1>
            <ul className="browse-deck-list">
               {decks.map((deck) => (
                  <li key={deck.id} className="browse-deck-item">
                     <h3 className="deck-name">{deck.name}</h3>
                     <div className="deck-actions">
                        <button className="enter-button" onClick={() => handleEnterDeck(deck.id)}>
                           <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                        <button className="remove-button" onClick={() => handleOpenDeleteDialog(deck.id)}>
                           <i class="fa-solid fa-trash"></i>
                        </button>
                     </div>
                  </li>
               ))}
            </ul>

            {deleteDialog.isOpen && (
               <div className="delete-dialog-overlay">
                  <div className="delete-dialog">
                     <h2>Confirm Deletion</h2>
                     <p>Are you sure you want to delete this deck and all its flashcards?</p>
                     <div className="dialog-actions">
                        <button className="confirm-button" onClick={handleRemoveDeck}>
                           Yes, Delete
                        </button>
                        <button className="cancel-button" onClick={handleCloseDeleteDialog}>
                           Cancel
                        </button>
                     </div>
                  </div>
               </div>
            )}
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
                        <i class="fa-solid fa-pen-to-square"></i>
                     </button>
                     <button className="remove-button" onClick={() => handleOpenDeleteFlashcardDialog(flashcard.id)}>
                        <i className="fa-solid fa-trash"></i>
                     </button>
                  </div>
               </li>
            ))}
         </ul>

         {editDialog.isOpen && (
            <div className="edit-dialog-overlay">
               <div className="edit-dialog">
                  <h2>Edit Flashcard</h2>
                  <form
                     onSubmit={(e) => {
                        e.preventDefault();
                        handleEditFlashcard();
                     }}>
                     <label htmlFor="front-text">
                        Front:
                        <input
                           id="front-text"
                           type="text"
                           value={editDialog.flashcard.front}
                           onChange={(e) =>
                              setEditDialog({
                                 ...editDialog,
                                 flashcard: { ...editDialog.flashcard, front: e.target.value },
                              })
                           }
                           required
                        />
                     </label>
                     <label htmlFor="back-text">
                        Back:
                        <input
                           id="back-text"
                           type="text"
                           value={editDialog.flashcard.back}
                           onChange={(e) =>
                              setEditDialog({
                                 ...editDialog,
                                 flashcard: { ...editDialog.flashcard, back: e.target.value },
                              })
                           }
                           required
                        />
                     </label>
                     <div className="dialog-actions">
                        <button type="submit" className="save-button">
                           Save
                        </button>
                        <button type="button" className="cancel-button" onClick={handleCloseEditDialog}>
                           Cancel
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
         {deleteFlashcardDialog.isOpen && (
            <div className="delete-dialog-overlay">
               <div className="delete-dialog">
                  <h2>Confirm Deletion</h2>
                  <p>Are you sure you want to delete this flashcard?</p>
                  <div className="dialog-actions">
                     <button className="confirm-button" onClick={handleRemoveFlashcard}>
                        Yes, Delete
                     </button>
                     <button className="cancel-button" onClick={handleCloseDeleteFlashcardDialog}>
                        Cancel
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Library;
