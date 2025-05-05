# Cardpium

Cardpium is a modern, full-stack flashcard management application that helps you create, organize, and study flashcards in an intuitive interface. Built with React for the frontend and Express for the backend, Cardpium provides a seamless experience for managing your study materials. With support for creating decks and flashcards, it’s the perfect tool for students, educators, and lifelong learners.

---

## 1. Features

### 1.1 📁 Deck Management

-  Create and manage decks to organize your flashcards.
-  View all available decks in a dropdown menu.
-  Add new decks dynamically through a simple interface.

### 1.2 📝 Flashcard Creation

-  Create flashcards with a front and back text.
-  Assign flashcards to specific decks.
-  Real-time updates to your flashcard collection.

### 1.3 👤 User Features

-  Secure user authentication including 2FA and session management.
-  Personal workspace for managing decks and flashcards.

### 1.4 Ideas to implement in the future

-  Use OpenAI's API to generate flashcards from user-provided text or documents.
-  Allow users to add tags to flashcards for better organization and filtering.
-  Add a search bar to quickly find flashcards by keywords.
-  Allow users to import/export flashcards in CSV or JSON format.
-  Allow users to share decks with others via a unique link or email.
-  Enable sorting decks by name, creation date, or number of flashcards.
-  Provide users with insights into their study habits, such as time spent studying or flashcards reviewed.
-  Add login options using Google, Facebook, or GitHub.

---

## 2. Setup Instructions

### 2.1 Prerequisites

-  Node.js and npm.
-  MySQL database.

### 2.2 Initial Setup

1. Clone the repository:

```bash
git clone https://github.com/joaolscosta/cardpium
cd cardpium
```

2. Navigate to server directory and create a `.env` file:

```bash
cd server
touch .env
```

3. Add the following environment variables to `.env`:

```bash
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=cardpium
PORT=3001
EMAIL_USER=email_that_will_send_the_verification_codes_for_2fa
EMAIL_PASS=gmail_app_password_DIFF_FROM_YOUR_EMAIL
```

Give permissions to the executable file and run the server:

```bash
chmod +x init_backend.sh
./init_backend.sh
```

4. Navigate to client directory, give permissions to the executable file and run the client:

```bash
cd ../client
chmod +x init_frontend.sh
./init_frontend.sh
```

5. Open your browser and go to `http://localhost:5173` to access the application.

---

## 3. License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
