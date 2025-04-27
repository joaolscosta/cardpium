import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/StudyDeck.css";

const StudyDeck = ({ deckId, setStudyDeckId }) => {
   const [flashcards, setFlashcards] = useState([]);
   const [currentCardIndex, setCurrentCardIndex] = useState(null);
   const [showAnswer, setShowAnswer] = useState(false);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchFlashcards = async () => {
         try {
            const response = await axios.get(`http://localhost:3001/flashcards?deckId=${deckId}`, {
               withCredentials: true,
            });
            setFlashcards(shuffleArray(response.data));
         } catch (error) {
            console.error("Error fetching flashcards:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchFlashcards();
   }, [deckId]);

   // Shuffle the flashcards array
   const shuffleArray = (array) => {
      return array.sort(() => Math.random() - 0.5);
   };

   const handleNextQuestion = () => {
      setShowAnswer(false); // Hide the answer
      if (currentCardIndex === null || currentCardIndex >= flashcards.length - 1) {
         setCurrentCardIndex(0); // Restart from the first card
      } else {
         setCurrentCardIndex(currentCardIndex + 1); // Move to the next card
      }
   };

   if (loading) {
      return <p>Loading flashcards...</p>;
   }

   if (flashcards.length === 0) {
      return (
         <div>
            <p>No flashcards available in this deck.</p>
            <button onClick={() => setStudyDeckId(null)}>Back to Dashboard</button>
         </div>
      );
   }

   const currentCard = flashcards[currentCardIndex ?? 0];

   return (
      <div>
         <h1>Study Deck</h1>
         <div className="flashcard">
            <p className="flashcard-front">{currentCard.front}</p>
            {showAnswer && (
               <p className="flashcard-back">
                  <strong>Answer:</strong> {currentCard.back}
               </p>
            )}
         </div>
         <div className="study-buttons">
            {!showAnswer ? (
               <button onClick={() => setShowAnswer(true)}>Show Answer</button>
            ) : (
               <button onClick={handleNextQuestion}>Next Question</button>
            )}
         </div>
      </div>
   );
};

export default StudyDeck;
