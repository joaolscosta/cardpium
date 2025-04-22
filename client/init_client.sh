#!/bin/bash

echo "Initializing frontend..."
npm install
npx @tailwindcss/cli -i ./src/styles/index.css -o ./src/output.css
npm run dev