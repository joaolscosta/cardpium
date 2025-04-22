import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

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

app.post("/register", async (req, res) => {
   const { username, email, password } = req.body;

   if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
   }

   try {
      // Check if the email or username already exists
      const checkQuery = "SELECT * FROM users WHERE email = ? OR username = ?";
      db.query(checkQuery, [email, username], async (err, results) => {
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

         const saltRounds = 10;
         const hashedPassword = await bcrypt.hash(password, saltRounds);

         // Insert the new user into the database
         const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
         db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
            if (err) {
               console.error("Error inserting user:", err);
               return res.status(500).json({ error: "Failed to register user" });
            }
            res.status(201).json({ message: "User registered successfully" });
         });
      });
   } catch (err) {
      console.error("Error hashing password:", err);
      res.status(500).json({ error: "Internal server error" });
   }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
