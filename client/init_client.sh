#!/bin/bash

echo "Initializing backend..."
cd server
npm install
node index.js & # Start backend in the background

echo "Initializing frontend..."
cd ../client
npm install
if [ ! -f tailwind.config.js ]; then
   npx tailwindcss init -p
   echo "Tailwind CSS initialized"
fi
npm run dev