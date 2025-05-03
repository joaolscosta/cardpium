import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

app.use(
   cors({
      origin: "http://localhost:5173",
      credentials: true,
   })
);
app.use(express.json());
app.use(cookieParser());

const db = mysql.createConnection({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME,
});

db.connect((err) => {
   if (err) {
      console.error("DB connection error:", err);
   } else {
      console.log("MySQL connected");
   }
});

app.get("/test", (req, res) => {
   res.send("running");
});

/* ------------------------ 2FA Verification Code Generation and Sending ------------------------ */

// TEMPORARY IN-MEMORY STORE
const verificationCodes = new Map();

function generateCode() {
   return Math.floor(1000 + Math.random() * 9000).toString();
}

async function sendVerificationEmail(email, code) {
   const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS,
      },
   });

   await transporter.sendMail({
      from: `"Cardpium" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Cardpium Verification Code",
      text: `Your 2FA verification code is ${code}. It expires in 10 minutes.`,
   });
}

/* --------------------------------------------------------------------------------------------- */

//* Register new user
app.post("/register", async (req, res) => {
   const { username, email, password } = req.body;

   if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
   }

   try {
      // Check if the email or username already exists
      const checkQuery = "SELECT * FROM users WHERE email = ? OR username = ?";
      db.query(checkQuery, [email, username], (err, results) => {
         if (err) {
            console.error("Error checking user:", err);
            return res.status(500).json({ error: "Internal server error" });
         }

         if (results.length > 0) {
            if (results[0].email === email) {
               return res.status(400).json({ error: "Email is already registered" });
            }
            if (results[0].username === username) {
               return res.status(400).json({ error: "Username is already taken" });
            }
         }

         // Generate and send the verification code
         const code = generateCode();
         const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

         const insertCodeQuery = `
            INSERT INTO verification_codes (email, code, expires_at, username, password)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE code = ?, expires_at = ?, username = ?, password = ?
         `;
         db.query(
            insertCodeQuery,
            [email, code, expiresAt, username, password, code, expiresAt, username, password],
            (err) => {
               if (err) {
                  console.error("Error storing verification code:", err);
                  return res.status(500).json({ error: "Internal server error" });
               }

               sendVerificationEmail(email, code)
                  .then(() => {
                     res.status(200).json({ message: "Verification code sent to your email." });
                  })
                  .catch((err) => {
                     console.error("Email send error:", err);
                     res.status(500).json({ error: "Failed to send verification code." });
                  });
            }
         );
      });
   } catch (err) {
      console.error("Error during registration:", err);
      res.status(500).json({ error: "Internal server error" });
   }
});

//* Verify the 2FA code
app.post("/verify-code", async (req, res) => {
   const { email, code } = req.body;

   const selectCodeQuery = "SELECT * FROM verification_codes WHERE email = ?";
   db.query(selectCodeQuery, [email], async (err, results) => {
      if (err) {
         console.error("Error fetching verification code:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
         return res.status(400).json({ error: "No code sent" });
      }

      // Check if the code is expired
      const entry = results[0];
      if (Date.now() > entry.expires_at) {
         const deleteCodeQuery = "DELETE FROM verification_codes WHERE email = ?";
         db.query(deleteCodeQuery, [email], (err) => {
            if (err) console.error("Error deleting expired code:", err);
         });
         return res.status(400).json({ error: "Code expired" });
      }

      if (entry.code !== code) {
         return res.status(400).json({ error: "Invalid code" });
      }

      // Create the user in the database
      const { username, password } = entry;
      try {
         const saltRounds = 10;
         const hashedPassword = await bcrypt.hash(password, saltRounds);

         const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
         db.query(insertQuery, [username, email, hashedPassword], (err) => {
            if (err) {
               console.error("Error inserting user:", err);
               return res.status(500).json({ error: "Failed to create user" });
            }

            const deleteCodeQuery = "DELETE FROM verification_codes WHERE email = ?";
            db.query(deleteCodeQuery, [email], (err) => {
               if (err) console.error("Error deleting used code:", err);
            });

            res.status(201).json({ message: "User created successfully" });
         });
      } catch (err) {
         console.error("Error hashing password:", err);
         res.status(500).json({ error: "Internal server error" });
      }
   });
});

//* Login user
app.post("/login", async (req, res) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
   }

   try {
      // Check if the user exists
      const query = "SELECT * FROM users WHERE email = ?";
      db.query(query, [email], async (err, results) => {
         if (err) {
            console.error("Error fetching user:", err);
            return res.status(500).json({ error: "Internal server error" });
         }

         if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
         }

         const user = results[0];

         // TODO - Commented for testing purposes
         // Compare the provided password with the hashed password in the database
         //const isPasswordValid = await bcrypt.compare(password, user.password);
         //if (!isPasswordValid) {
         //   return res.status(401).json({ error: "Invalid email or password" });
         //}

         // Generate a session token
         const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

         // Store the session token in the database
         const updateQuery = "UPDATE users SET session_id = ? WHERE id = ?";
         db.query(updateQuery, [sessionToken, user.id], (err) => {
            if (err) {
               console.error("Error updating session ID:", err);
               return res.status(500).json({ error: "Internal server error" });
            }

            // Set the session token as a cookie
            res.cookie("session_token", sessionToken, {
               httpOnly: true,
               secure: process.env.NODE_ENV === "production",
               maxAge: 24 * 60 * 60 * 1000, // 1 day
            });

            res.status(200).json({ message: "Login successful", user: { id: user.id, username: user.username } });
         });
      });
   } catch (err) {
      console.error("Error during login:", err);
      res.status(500).json({ error: "Internal server error" });
   }
});

//* Check if the user is authenticated
app.get("/auth-check", (req, res) => {
   const sessionToken = req.cookies.session_token;

   if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   // Check if the session token exists in the database
   const query = "SELECT * FROM users WHERE session_id = ?";
   db.query(query, [sessionToken], (err, results) => {
      if (err) {
         console.error("Error checking session token:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
         return res.status(401).json({ error: "Unauthorized" });
      }

      res.status(200).json({ message: "Authenticated", user: { id: results[0].id, username: results[0].username } });
   });
});

//* Logout user
app.post("/logout", (req, res) => {
   const sessionToken = req.cookies.session_token;

   if (!sessionToken) {
      return res.status(400).json({ error: "No session token provided" });
   }

   // Clear the session token in the database
   const query = "UPDATE users SET session_id = NULL WHERE session_id = ?";
   db.query(query, [sessionToken], (err) => {
      if (err) {
         console.error("Error clearing session token:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      // Clear the cookie
      res.clearCookie("session_token");
      res.status(200).json({ message: "Logout successful" });
   });
});

/* ------------------------ User Data Fetching ------------------------ */

//* Get logged-in user's information
app.get("/user", (req, res) => {
   const sessionToken = req.cookies.session_token;

   if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   const query = "SELECT username, email FROM users WHERE session_id = ?";
   db.query(query, [sessionToken], (err, results) => {
      if (err) {
         console.error("Error fetching user:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
         return res.status(401).json({ error: "Unauthorized" });
      }

      const user = results[0];
      res.status(200).json({ username: user.username, email: user.email });
   });
});

/* ------------------------ Decks and Flashcards ------------------------ */

//* Get all decks for the logged-in user
app.get("/decks", (req, res) => {
   const sessionToken = req.cookies.session_token;

   if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   // Find the user based on the session token
   const userQuery = "SELECT id FROM users WHERE session_id = ?";
   db.query(userQuery, [sessionToken], (err, results) => {
      if (err) {
         console.error("Error fetching user:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
         return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = results[0].id;

      // Fetch decks for the logged-in user
      const decksQuery = "SELECT * FROM decks WHERE user_id = ?";
      db.query(decksQuery, [userId], (err, decks) => {
         if (err) {
            console.error("Error fetching decks:", err);
            return res.status(500).json({ error: "Internal server error" });
         }

         res.status(200).json(decks);
      });
   });
});

//* Add a new deck for the logged-in user
app.post("/decks", (req, res) => {
   const sessionToken = req.cookies.session_token;
   const { name } = req.body;

   if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   if (!name) {
      return res.status(400).json({ error: "Deck name is required" });
   }

   // Find the user based on the session token
   const userQuery = "SELECT id FROM users WHERE session_id = ?";
   db.query(userQuery, [sessionToken], (err, results) => {
      if (err) {
         console.error("Error fetching user:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
         return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = results[0].id;

      // Insert the new deck for the logged-in user
      const insertDeckQuery = "INSERT INTO decks (name, user_id) VALUES (?, ?)";
      db.query(insertDeckQuery, [name, userId], (err, results) => {
         if (err) {
            console.error("Error adding deck:", err);
            return res.status(500).json({ error: "Internal server error" });
         }

         res.status(201).json({ id: results.insertId, name });
      });
   });
});

//* Add a new flashcard for a deck owned by the logged-in user
app.post("/flashcards", (req, res) => {
   const sessionToken = req.cookies.session_token;
   const { front, back, deckId } = req.body;

   if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   if (!front || !back || !deckId) {
      return res.status(400).json({ error: "All fields are required" });
   }

   // Find the user based on the session token
   const userQuery = "SELECT id FROM users WHERE session_id = ?";
   db.query(userQuery, [sessionToken], (err, results) => {
      if (err) {
         console.error("Error fetching user:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
         return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = results[0].id;

      // Verify that the deck belongs to the logged-in user
      const deckQuery = "SELECT * FROM decks WHERE id = ? AND user_id = ?";
      db.query(deckQuery, [deckId, userId], (err, results) => {
         if (err) {
            console.error("Error verifying deck ownership:", err);
            return res.status(500).json({ error: "Internal server error" });
         }

         if (results.length === 0) {
            return res.status(403).json({ error: "Forbidden: You do not own this deck" });
         }

         // Insert the new flashcard into the deck
         const insertFlashcardQuery = "INSERT INTO flashcards (front, back, deck_id) VALUES (?, ?, ?)";
         db.query(insertFlashcardQuery, [front, back, deckId], (err) => {
            if (err) {
               console.error("Error adding flashcard:", err);
               return res.status(500).json({ error: "Internal server error" });
            }

            res.status(201).json({ message: "Flashcard created successfully" });
         });
      });
   });
});

//* Get all flashcards for a specific deck
app.get("/flashcards", (req, res) => {
   const sessionToken = req.cookies.session_token;
   const { deckId } = req.query;

   if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   if (!deckId) {
      return res.status(400).json({ error: "Deck ID is required" });
   }

   // Find the user based on the session token
   const userQuery = "SELECT id FROM users WHERE session_id = ?";
   db.query(userQuery, [sessionToken], (err, results) => {
      if (err) {
         console.error("Error fetching user:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
         return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = results[0].id;

      // Verify that the deck belongs to the logged-in user
      const deckQuery = "SELECT * FROM decks WHERE id = ? AND user_id = ?";
      db.query(deckQuery, [deckId, userId], (err, results) => {
         if (err) {
            console.error("Error verifying deck ownership:", err);
            return res.status(500).json({ error: "Internal server error" });
         }

         if (results.length === 0) {
            return res.status(403).json({ error: "Forbidden: You do not own this deck" });
         }

         // Fetch flashcards for the deck
         const flashcardsQuery = "SELECT * FROM flashcards WHERE deck_id = ?";
         db.query(flashcardsQuery, [deckId], (err, flashcards) => {
            if (err) {
               console.error("Error fetching flashcards:", err);
               return res.status(500).json({ error: "Internal server error" });
            }

            res.status(200).json(flashcards);
         });
      });
   });
});

//* Delete a deck
app.delete("/decks/:deckId", (req, res) => {
   const sessionToken = req.cookies.session_token;
   const { deckId } = req.params;

   if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   const userQuery = "SELECT id FROM users WHERE session_id = ?";
   db.query(userQuery, [sessionToken], (err, results) => {
      if (err) {
         console.error("Error fetching user:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
         return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = results[0].id;

      // Verify that the deck belongs to the logged in user
      const deckQuery = "SELECT * FROM decks WHERE id = ? AND user_id = ?";
      db.query(deckQuery, [deckId, userId], (err, results) => {
         if (err) {
            console.error("Error verifying deck ownership:", err);
            return res.status(500).json({ error: "Internal server error" });
         }

         if (results.length === 0) {
            return res.status(403).json({ error: "Forbidden: You do not own this deck" });
         }

         // Delete the flashcards associated with the deck
         const deleteFlashcardsQuery = "DELETE FROM flashcards WHERE deck_id = ?";
         db.query(deleteFlashcardsQuery, [deckId], (err) => {
            if (err) {
               console.error("Error deleting flashcards:", err);
               return res.status(500).json({ error: "Internal server error" });
            }

            // Delete the deck
            const deleteDeckQuery = "DELETE FROM decks WHERE id = ?";
            db.query(deleteDeckQuery, [deckId], (err) => {
               if (err) {
                  console.error("Error deleting deck:", err);
                  return res.status(500).json({ error: "Internal server error" });
               }

               res.status(200).json({ message: "Deck and associated flashcards deleted successfully" });
            });
         });
      });
   });
});

//* Delete a flashcard
app.delete("/flashcards/:flashcardId", (req, res) => {
   const sessionToken = req.cookies.session_token;
   const { flashcardId } = req.params;

   if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   // Verify the user owns the flashcard
   const userQuery = `
      SELECT f.id 
      FROM flashcards f
      JOIN decks d ON f.deck_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE f.id = ? AND u.session_id = ?`;

   db.query(userQuery, [flashcardId, sessionToken], (err, results) => {
      if (err) {
         console.error("Error verifying flashcard ownership:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
         return res.status(403).json({ error: "Forbidden: You do not own this flashcard" });
      }

      // Delete the flashcard
      const deleteQuery = "DELETE FROM flashcards WHERE id = ?";
      db.query(deleteQuery, [flashcardId], (err) => {
         if (err) {
            console.error("Error deleting flashcard:", err);
            return res.status(500).json({ error: "Internal server error" });
         }

         res.status(200).json({ message: "Flashcard deleted successfully" });
      });
   });
});

//* Update a flashcard
app.put("/flashcards/:flashcardId", (req, res) => {
   const sessionToken = req.cookies.session_token;
   const { flashcardId } = req.params;
   const { front, back } = req.body;

   if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   if (!front || !back) {
      return res.status(400).json({ error: "Both front and back text are required" });
   }

   // Verify the user owns the flashcard
   const userQuery = `
      SELECT f.id 
      FROM flashcards f
      JOIN decks d ON f.deck_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE f.id = ? AND u.session_id = ?`;

   db.query(userQuery, [flashcardId, sessionToken], (err, results) => {
      if (err) {
         console.error("Error verifying flashcard ownership:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
         return res.status(403).json({ error: "Forbidden: You do not own this flashcard" });
      }

      // Update the flashcard
      const updateQuery = "UPDATE flashcards SET front = ?, back = ? WHERE id = ?";
      db.query(updateQuery, [front, back, flashcardId], (err) => {
         if (err) {
            console.error("Error updating flashcard:", err);
            return res.status(500).json({ error: "Internal server error" });
         }

         res.status(200).json({ message: "Flashcard updated successfully" });
      });
   });
});

//* Update username
app.put("/user/username", (req, res) => {
   const sessionToken = req.cookies.session_token;
   const { newUsername } = req.body;

   if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   if (!newUsername) {
      return res.status(400).json({ error: "New username is required" });
   }

   const query = "UPDATE users SET username = ? WHERE session_id = ?";
   db.query(query, [newUsername, sessionToken], (err) => {
      if (err) {
         console.error("Error updating username:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      res.status(200).json({ message: "Username updated successfully" });
   });
});

//* Update password
app.put("/user/password", async (req, res) => {
   const sessionToken = req.cookies.session_token;
   const { currentPassword, newPassword } = req.body;

   if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new passwords are required" });
   }

   const query = "SELECT * FROM users WHERE session_id = ?";
   db.query(query, [sessionToken], async (err, results) => {
      if (err) {
         console.error("Error fetching user:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
         return res.status(401).json({ error: "Unauthorized" });
      }

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
         return res.status(400).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updateQuery = "UPDATE users SET password = ? WHERE session_id = ?";
      db.query(updateQuery, [hashedPassword, sessionToken], (err) => {
         if (err) {
            console.error("Error updating password:", err);
            return res.status(500).json({ error: "Internal server error" });
         }

         res.status(200).json({ message: "Password updated successfully" });
      });
   });
});

//* Delete account
app.delete("/user", (req, res) => {
   const sessionToken = req.cookies.session_token;

   if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   const query = "DELETE FROM users WHERE session_id = ?";
   db.query(query, [sessionToken], (err) => {
      if (err) {
         console.error("Error deleting account:", err);
         return res.status(500).json({ error: "Internal server error" });
      }

      res.clearCookie("session_token");
      res.status(200).json({ message: "Account deleted successfully" });
   });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
