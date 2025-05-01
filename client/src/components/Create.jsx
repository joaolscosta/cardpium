import React, { useState, useEffect } from "react";
import "../styles/Create.css";

const Create = () => {
   const [front, setFront] = useState("");
   const [back, setBack] = useState("");
   const [selectedDeck, setSelectedDeck] = useState("");
   const [decks, setDecks] = useState([]);
   const [newDeckName, setNewDeckName] = useState("");
   const [showDialog, setShowDialog] = useState(false);
   const [errorMessage, setErrorMessage] = useState("");

   // Run at the start to fetch the decks
   useEffect(() => {
      fetch("http://localhost:3001/decks", {
         method: "GET",
         credentials: "include",
      })
         .then((response) => {
            if (!response.ok) {
               throw new Error("Failed to fetch decks");
            }
            return response.json();
         })
         .then((data) => setDecks(data))
         .catch((error) => console.error("Error fetching decks:", error));
   }, []);

   const handleAddDeck = () => {
      if (!newDeckName) {
         setErrorMessage("Please enter a deck name.");
         return;
      }

      fetch("http://localhost:3001/decks", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
         body: JSON.stringify({ name: newDeckName }),
      })
         .then((response) => {
            if (!response.ok) {
               throw new Error("Failed to add deck");
            }
            return response.json();
         })
         .then((data) => {
            setDecks([...decks, data]); // Add the new deck to the list
            setNewDeckName("");
            setShowDialog(false);
            setErrorMessage("");
         })
         .catch((error) => {
            console.error("Error adding deck:", error);
            setErrorMessage("Error adding deck. Please try again.");
         });
   };

   const handleCreateFlashcard = () => {
      if (!front || !back || !selectedDeck) {
         setErrorMessage("Please fill in all fields.");
         return;
      }

      fetch("http://localhost:3001/flashcards", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
         body: JSON.stringify({
            front,
            back,
            deckId: selectedDeck,
         }),
      })
         .then((response) => {
            if (!response.ok) {
               throw new Error("Failed to create flashcard");
            }
            return response.json();
         })
         .then(() => {
            setFront("");
            setBack("");
            setErrorMessage("");
         })
         .catch((error) => {
            console.error("Error creating flashcard:", error);
            setErrorMessage("Error creating flashcard. Please try again.");
         });
   };

   return (
      <div className="create-container">
         <h1>Create Flashcard</h1>
         <form className="create-form" onSubmit={(e) => e.preventDefault()}>
            <div>
               <label>Front:</label>
               <input
                  type="text"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="Enter the front text"
               />
            </div>
            <div>
               <label>Back:</label>
               <input
                  type="text"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="Enter the back text"
               />
            </div>
            <div>
               <label>Deck:</label>
               <select value={selectedDeck} onChange={(e) => setSelectedDeck(e.target.value)}>
                  <option value="" disabled>
                     Select a deck
                  </option>
                  {decks.map((deck) => (
                     <option key={deck.id} value={deck.id}>
                        {deck.name}
                     </option>
                  ))}
               </select>
            </div>
         </form>
         {errorMessage && <p className="error-message">{errorMessage}</p>}
         <div className="create-buttons">
            <button onClick={handleCreateFlashcard}>
               <i class="fa-solid fa-plus"></i>
            </button>
            <button onClick={() => setShowDialog(true)}>Add New Deck</button>
         </div>

         {showDialog && (
            <div className="dialog-overlay">
               <div className="dialog">
                  <h2>Add New Deck</h2>
                  <input
                     type="text"
                     value={newDeckName}
                     onChange={(e) => setNewDeckName(e.target.value)}
                     placeholder="Enter new deck name"
                  />
                  <div className="dialog-buttons">
                     <button onClick={handleAddDeck}>Add Deck</button>
                     <button onClick={() => setShowDialog(false)}>Cancel</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Create;
