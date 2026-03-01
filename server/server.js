require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Ollama } = require('ollama');

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 5000;
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

// Middleware
app.use(express.json());
app.use(cors());

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Schema (Must match what we seeded)
const LoreSchema = new mongoose.Schema({
  title: String,
  content: String,
  type: String,
  embedding: [Number] 
});
const Lore = mongoose.model('Lore', LoreSchema);

// --- GAME LOGIC ENDPOINTS ---

// 1. START GAME: Resets stats
app.post('/api/start', (req, res) => {
  // In a real app, you'd create a specific User/Save file here.
  // For now, we just send back the starting stats.
  res.json({
    message: "Game Started",
    stats: {
      health: 100,
      food: 500, // lbs
      distance: 0, // miles
      day: 1
    },
    narrative: "You are at Independence, Missouri. The year is 1848. You have a wagon, oxen, and provisions. The trail awaits."
  });
});

// 2. TAKE TURN: The Core Loop
app.post('/api/turn', async (req, res) => {
  const { action, gameState } = req.body;
  let currentStats = { ...gameState };

  try {
    // A. VECTOR SEARCH (The Memory)
    // 1. Turn user action into numbers
    const queryEmbedding = await ollama.embeddings({
      model: 'llama3', // Must match your local model name
      prompt: action,
    });

    // 2. Find relevant rules in MongoDB
    const relevantRules = await Lore.aggregate([
      {
        "$vectorSearch": {
          "index": "vector_index", // Must match the name in Atlas
          "path": "embedding",
          "queryVector": queryEmbedding.embedding,
          "numCandidates": 50,
          "limit": 1 // Only get the single most relevant rule
        }
      },
      {
        "$project": {
          "_id": 0,
          "content": 1,
          "type": 1
        }
      }
    ]);

    const ruleContext = relevantRules.length > 0 ? relevantRules[0].content : "Standard trail travel rules apply.";
    console.log(`🔍 Found Rule: ${ruleContext}`);

    // B. AI GENERATION (The Storyteller)
    const systemPrompt = `
      You are the Game Master of a grim Oregon Trail text adventure.
      
      CURRENT STATUS:
      - Health: ${currentStats.health}
      - Food: ${currentStats.food}
      - Day: ${currentStats.day}
      
      USER ACTION: "${action}"
      
      GAME RULE TO ENFORCE: "${ruleContext}"
      
      INSTRUCTIONS:
      1. Write a short (2 sentences) outcome of the action based on the rule.
      2. If the rule implies damage (like snakebite), describe it.
      3. Do NOT mention game stats explicitly in the text (e.g., don't say "You lost 10 HP").
      4. End with "What do you do next?"
    `;

    const response = await ollama.chat({
      model: 'llama3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: action }
      ],
    });

    // C. STATE UPDATE (The Math)
    // Simple logic: Every turn consumes food and takes 1 day
    currentStats.food -= 5;
    currentStats.day += 1;
    
    // (Optional: You can use regex to parse the AI response for damage keywords if you want to get fancy later)

    res.json({
      narrative: response.message.content,
      stats: currentStats
    });

  } catch (error) {
    console.error("Game Error:", error);
    res.status(500).json({ error: "The Game Master is confused." });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));