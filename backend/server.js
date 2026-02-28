const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to your local Ollama instance
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

app.post('/api/action', async (req, res) => {
  try {
    const { playerAction, gameState } = req.body;

    // This is where you force the LLM to follow the game rules
    const systemPrompt = `You are the game master for a survival trail game. 
    The player's current health is ${gameState.health} and food is ${gameState.food}.
    The player chose to: ${playerAction}. 
    Write a 2-sentence outcome and provide 3 new choices for the next turn.`;

    const response = await ollama.chat({
      model: 'llama3', // or 'qwen2.5'
      messages: [{ role: 'system', content: systemPrompt }],
    });

    res.json({ narrative: response.message.content });

  } catch (error) {
    console.error("Ollama Error:", error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Game Master running on port ${PORT}`));