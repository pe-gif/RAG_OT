import { useState } from 'react'

function App() {
  const [story, setStory] = useState("You are at the start of the trail. What do you do?");
  const [loading, setLoading] = useState(false);

  // Hardcoded state for testing
  const gameState = { health: 100, food: 50 };

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerAction: action, gameState: gameState })
      });
      
      const data = await response.json();
      setStory(data.narrative);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Trail Survival Game</h1>
      <p>{loading ? "The Game Master is thinking..." : story}</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={() => handleAction("Hunt for food")}>Hunt</button>
        <button onClick={() => handleAction("Push forward")}>Travel</button>
        <button onClick={() => handleAction("Rest")}>Rest</button>
      </div>
    </div>
  )
}

export default App
