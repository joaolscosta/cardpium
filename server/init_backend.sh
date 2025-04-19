#!/bin/bash

echo "Initializing backend..."

# Load environment variables from .env
export $(grep -v '^#' .env | xargs)

# Ensure the database table exists
echo "Ensuring 'users' table exists..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
CREATE TABLE IF NOT EXISTS users (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   email VARCHAR(255) UNIQUE NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

# Install dependencies
npm install

# Start the backend server
node index.js