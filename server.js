require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from the public folder

// Initialize Groq AI (You MUST set GROQ_API_KEY in your .env file)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// API endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Check if API key is properly set
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.json({ reply: "⚠️ Please set your `GROQ_API_KEY` in the `.env` file and restart the server!" });
        }

        // Call the incredibly fast Groq API using Llama-3 model
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are AskWise AI, a very helpful, friendly, and smart virtual assistant. Keep your answers concise, clear, and professional." },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 500,
        });

        const text = chatCompletion.choices[0]?.message?.content || "I couldn't process that request.";

        res.json({ reply: text });


    } catch (error) {
        console.error('Error processing chat (Fallback active):', error ? error.message : 'Unknown error');

        const q = req.body.message ? req.body.message.toLowerCase() : "";
        let fallbackReply = "That's an interesting question! My real AI brain is currently disconnected due to an API key issue, so I am using my offline memory. If you want me to answer random questions, please provide a valid API key!";

        if (q.includes('what is') || q.includes('about')) {
            fallbackReply = "AskWise AI is a modern chat interface designed to provide quick and intelligent answers to frequently asked questions. My AI brain is currently offline, so I'm giving a cached answer!";
        } else if (q.includes('how does it work') || q.includes('work')) {
            fallbackReply = "It's simple! You type your question, and normally I'd use Gemini AI to answer. Since it's offline right now, I'm using local keyword matching.";
        } else if (q.includes('contact') || q.includes('support')) {
            fallbackReply = "For support, you can reach out to our team at support@askwiseai.example.com.";
        } else if (q.includes('pricing') || q.includes('cost') || q.includes('free')) {
            fallbackReply = "AskWise AI basic features are completely free!";
        } else if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
            fallbackReply = "Hello there! How can I assist you today? (Offline Mode)";
        }

        res.json({ reply: fallbackReply });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
