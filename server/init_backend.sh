#!/bin/bash

echo "Initializing backend..."

export $(grep -v '^#' .env | xargs)

# Ensure the database exists
echo "Ensuring database '$DB_NAME' exists..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
EOF

# Drop and recreate the 'users' table
echo "Dropping and recreating 'users' table..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
DROP TABLE IF EXISTS users;
CREATE TABLE users (
   id INT AUTO_INCREMENT PRIMARY KEY,
   username VARCHAR(255) UNIQUE NOT NULL,
   email VARCHAR(255) UNIQUE NOT NULL,
   password VARCHAR(255) NOT NULL,
   session_id VARCHAR(255) DEFAULT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default user
INSERT INTO users (username, email, password) VALUES
('joao', 'joaoluissaraivacosta@gmail.com', '\$2b\$10\$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf8a9OZxQH6h6FzF7z5W2');
EOF

npm install
node index.js