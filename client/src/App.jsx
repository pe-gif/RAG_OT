"use client";
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  // --- STATE ---
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]); // Stores the chat log
  const [stats, setStats] = useState({ health: 100, food: 500, distance: 0, day: 1 });
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Start Game on Load
  useEffect(() => {
    startGame();
  }, []);

  const startGame = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/start', { method: 'POST' });
      const data = await res.json();
      setHistory([{ role: 'gm', content: data.narrative }]);
      setStats(data.stats);
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  const handleTurn = async () => {
    if (!input.trim()) return;
    
    const userAction = input;
    setInput(""); // Clear input immediately
    setLoading(true);

    // 1. Add User's move to history
    setHistory(prev => [...prev, { role: 'user', content: userAction }]);

    try {
      // 2. Send to Backend
      const res = await fetch('http://localhost:5000/api/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: userAction, 
          gameState: stats 
        }),
      });

      const data = await res.json();

      // 3. Update UI with AI response and new stats
      setHistory(prev => [...prev, { role: 'gm', content: data.narrative }]);
      setStats(data.stats);

    } catch (err) {
      setHistory(prev => [...prev, { role: 'gm', content: "Error: The server is not responding. Is Ollama running?" }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-green-400 font-mono p-4 flex flex-col items-center">
      
      {/* HEADER / STATS BAR */}
      <div className="w-full max-w-2xl border-b-2 border-green-700 pb-4 mb-4 flex justify-between text-sm md:text-base">
        <span>❤️ HEALTH: {stats.health}</span>
        <span>🍖 FOOD: {stats.food} lbs</span>
        <span>📅 DAY: {stats.day}</span>
      </div>

      {/* GAME LOG (SCROLLABLE) */}
      <div className="flex-1 w-full max-w-2xl bg-black border-2 border-green-800 p-4 mb-4 overflow-y-auto h-[60vh] rounded shadow-[0_0_15px_rgba(0,255,0,0.2)]">
        {history.map((msg, idx) => (
          <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded ${msg.role === 'user' ? 'bg-green-900 text-white' : 'text-green-400'}`}>
              {msg.role === 'gm' && <span className="mr-2">🤖</span>}
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-green-600 animate-pulse">...Thinking...</div>}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="w-full max-w-2xl flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTurn()}
          placeholder="What do you do? (e.g., 'Hunt for buffalo')" 
          className="flex-1 bg-black border border-green-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
          disabled={loading}
        />
        <button 
          onClick={handleTurn}
          disabled={loading}
          className="bg-green-700 hover:bg-green-600 text-black font-bold py-3 px-6 rounded transition-colors"
        >
          SEND
        </button>
      </div>

    </div>
  );
}