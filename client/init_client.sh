#!/bin/bash

echo "Initializing frontend..."
npm install
npx @tailwindcss/cli -i ./src/App.css -o ./src/output.css
npm run dev