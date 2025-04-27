#!/bin/bash

echo "Initializing backend..."

export $(grep -v '^#' .env | xargs)

echo "Dropping and recreating database '$DB_NAME'..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF

echo "Creating tables and populating database..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
-- Users table
CREATE TABLE users (
   id INT AUTO_INCREMENT PRIMARY KEY,
   username VARCHAR(255) UNIQUE NOT NULL,
   email VARCHAR(255) UNIQUE NOT NULL,
   password VARCHAR(255) NOT NULL,
   session_id VARCHAR(255) DEFAULT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Decks table
CREATE TABLE decks (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   user_id INT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Flashcards table
CREATE TABLE flashcards (
   id INT AUTO_INCREMENT PRIMARY KEY,
   front TEXT NOT NULL,
   back TEXT NOT NULL,
   deck_id INT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

-- Verification codes table
CREATE TABLE verification_codes (
   email VARCHAR(255) PRIMARY KEY,
   code VARCHAR(10) NOT NULL,
   expires_at BIGINT NOT NULL,
   username VARCHAR(255) NOT NULL,
   password VARCHAR(255) NOT NULL
);

-- Insert admin credentials
INSERT INTO users (username, email, password) VALUES
('admin', 'admin@example.com', '\$2b\$10\$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf4z8E9OZ8K2J7N6zYb7e'); -- Password: admin123
EOF

echo "Installing dependencies..."
npm install

echo "Starting the server..."
node index.js