#!/bin/bash

echo "Initializing backend..."

export $(grep -v '^#' .env | xargs)

echo "Dropping and recreating database '$DB_NAME'..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF

echo "Creating 'users' table and populating db..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
CREATE TABLE users (
   id INT AUTO_INCREMENT PRIMARY KEY,
   username VARCHAR(255) UNIQUE NOT NULL,
   email VARCHAR(255) UNIQUE NOT NULL,
   password VARCHAR(255) NOT NULL,
   session_id VARCHAR(255) DEFAULT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test users
INSERT INTO users (username, email, password) VALUES
('testuser', 'testuser@example.com', '\$2b\$10\$CwTycUXWue0Thq9StjUM0uJ8z1ZzFQ5eG/9qz5eG/9qz5eG/9qz5e'), -- Password: test1234
('admin', 'admin@example.com', '\$2b\$10\$7QJt1E9J8z1ZzFQ5eG/9qz5eG/9qz5eG/9qz5eG/9qz5eG/9qz5e'); -- Password: admin123
EOF

echo "Installing dependencies..."
npm install

echo "Starting the server..."
node index.js