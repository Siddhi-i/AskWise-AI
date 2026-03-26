# 🤖 AskWise AI

AskWise AI is a fast and intelligent AI-powered chatbot designed to provide instant answers to user questions.
It combines a modern web interface with a powerful AI backend to deliver real-time conversational responses.

The chatbot uses the **Groq API with the Llama-3.3-70B model**, enabling extremely fast and accurate AI responses.

---

## 🚀 Features

* AI-powered chatbot for answering user questions
* Fast responses using Groq LLM
* Clean and responsive chat interface
* Typing indicator for realistic chat interaction
* Dark / Light mode UI
* Offline keyword fallback system for reliability
* Secure API key handling using environment variables

---

## 🛠 Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### AI Engine

* Groq API
* Llama-3.3-70B Language Model

### Tools

* VS Code
* Git
* GitHub

---

## 📂 Project Structure

AskWiseAI/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example
└── README.md

---

## ⚙️ Installation

### 1. Clone the repository

git clone https://github.com/YOURUSERNAME/AskWise-AI.git

### 2. Navigate into the project folder

cd AskWise-AI

### 3. Install dependencies

npm install

### 4. Create a `.env` file

Add your API key inside `.env`:

GROQ_API_KEY=your_api_key_here

### 5. Start the server

node server.js

### 6. Open in browser

http://localhost:3000

---

## 🧠 How It Works

1. The user types a question in the chat interface.
2. The frontend sends the request to the backend using `fetch()`.
3. The Node.js server processes the request.
4. The request is sent to the **Groq AI model**.
5. The AI generates a response.
6. The response is sent back to the frontend and displayed to the user.

If the AI API fails, the system automatically switches to a **local keyword fallback system**, ensuring the chatbot continues working.

---

## 🔒 Security

API keys are stored in a `.env` file and are not uploaded to GitHub.
The `.env` file is ignored using `.gitignore` to protect sensitive information.

---

## 📈 Future Improvements

* Voice-based chatbot interaction
* Multi-language support
* Chat history memory
* Cloud deployment
* Advanced conversation context handling

---

## 👩‍💻 Author
Siddhi
Developed as part of a web development project.

---
