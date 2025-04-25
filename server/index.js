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
         verificationCodes.set(email, { code, expiresAt, username, password });

         sendVerificationEmail(email, code)
            .then(() => {
               res.status(200).json({ message: "Verification code sent to your email." });
            })
            .catch((err) => {
               console.error("Email send error:", err);
               res.status(500).json({ error: "Failed to send verification code." });
            });
      });
   } catch (err) {
      console.error("Error during registration:", err);
      res.status(500).json({ error: "Internal server error" });
   }
});

//* Verify the 2FA code
app.post("/verify-code", async (req, res) => {
   const { email, code } = req.body;
   const entry = verificationCodes.get(email);

   if (!entry) return res.status(400).json({ error: "No code sent" });
   if (Date.now() > entry.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: "Code expired" });
   }

   if (entry.code !== code) return res.status(400).json({ error: "Invalid code" });

   // Create the user in the database
   const { username, password } = entry;
   try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
      db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
         if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ error: "Failed to create user" });
         }

         verificationCodes.delete(email);
         res.status(201).json({ message: "User created successfully" });
      });
   } catch (err) {
      console.error("Error hashing password:", err);
      res.status(500).json({ error: "Internal server error" });
   }
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
