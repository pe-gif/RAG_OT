import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import ollama from 'ollama';
import dotenv from 'dotenv'; 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow React to talk to this server
app.use(express.json());

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ Atlas Error:', err));

// 2. Define the Schema (Structure of your data)
const ChatSchema = new mongoose.Schema({
  role: String,
  content: String,
  timestamp: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', ChatSchema);

// 3. API Endpoint: Chat with AI
app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;

  try {
    // A. Generate Response from Ollama
    const response = await ollama.chat({
      model: 'llama3', // Make sure you pulled this model!
      messages: [{ role: 'user', content: prompt }],
    });

    const aiResponse = response.message.content;

    // B. Save User Prompt to DB
    await Chat.create({ role: 'user', content: prompt });

    // C. Save AI Response to DB
    await Chat.create({ role: 'assistant', content: aiResponse });

    // D. Send response back to Frontend
    res.json({ response: aiResponse });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. API Endpoint: Get History
app.get('/api/history', async (req, res) => {
  const history = await Chat.find().sort({ timestamp: 1 });
  res.json(history);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});