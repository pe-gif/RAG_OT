const mongoose = require('mongoose');
const { Ollama } = require('ollama');
const fs = require('fs');
require('dotenv').config();

// 1. Define the Schema (Must match server.js)
const LoreSchema = new mongoose.Schema({
  title: String,
  content: String,
  type: String,
  embedding: [Number] 
});
const Lore = mongoose.model('Lore', LoreSchema);

// 2. Setup Ollama & Data
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
const gameRules = JSON.parse(fs.readFileSync('./data/gameRules.json', 'utf-8'));

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🌱 Connected to MongoDB...");

    // Clear old data
    await Lore.deleteMany({});
    console.log("🧹 Cleared old rules.");

    // Loop through rules and vectorize them
    for (const rule of gameRules) {
      process.stdout.write(`Processing: ${rule.title}... `);
      
      const response = await ollama.embeddings({
        model: 'llama3', // Make sure this matches your running model
        prompt: rule.content,
      });

      await Lore.create({
        title: rule.title,
        type: rule.type,
        content: rule.content,
        embedding: response.embedding
      });
      console.log("✅ Done.");
    }

    console.log("🎉 Database Seeded! Now go create the Vector Index on Atlas.");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Error:", err);
    process.exit(1);
  }
};

seedDB();