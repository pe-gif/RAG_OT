import { useState } from 'react';

export default function App() {
  // 1. STATE: The memory of the app
  const [input, setInput] = useState(""); // What you are typing right now
  const [messages, setMessages] = useState([
    { role: "ai", content: "I am the Trail Master. What is your command?" }
  ]);
  const [loading, setLoading] = useState(false);

  // 2. LOGIC: Sending the message to the backend
  const sendMessage = async () => {
    if (!input) return;

    // Add YOUR message to the screen immediately
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Talk to the Game Master (Express Backend)
      // Note: We are sending 'playerAction' because that matches your backend code!
      const response = await fetch('http://localhost:5000/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playerAction: input, 
          gameState: { health: 100, food: 50 } // Hardcoded stats for now
        }) 
      });

      const data = await response.json();

      // Add AI's response to the screen
      setMessages([...newMessages, { role: "ai", content: data.narrative }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([...newMessages, { role: "ai", content: "Error connecting to server." }]);
    }

    setLoading(false);
    setInput(""); // Clear the text box
  };

  // 3. UI: How it looks (JSX)
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Oregon Trail AI Chat</h1>
      
      {/* The Chat Window */}
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={msg.role === 'ai' ? styles.aiMsg : styles.userMsg}>
            <strong>{msg.role === 'ai' ? "🤖 GM: " : "👤 You: "}</strong>
            {msg.content}
          </div>
        ))}
        {loading && <div style={styles.loading}>Generating story...</div>}
      </div>

      {/* The Input Area */}
      <div style={styles.inputArea}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type an action (e.g., 'Hunt for food')..."
          style={styles.input}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} style={styles.button}>Send</button>
      </div>
    </div>
  );
}

// Simple CSS styles (CSS-in-JS) so it looks decent immediately
const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'monospace' },
  header: { textAlign: 'center', color: '#2c3e50' },
  chatBox: { border: '2px solid #333', height: '400px', overflowY: 'scroll', padding: '10px', marginBottom: '10px', backgroundColor: '#f9f9f9' },
  userMsg: { margin: '10px 0', textAlign: 'right', color: 'blue' },
  aiMsg: { margin: '10px 0', textAlign: 'left', color: 'green' },
  loading: { textAlign: 'center', fontStyle: 'italic', color: '#888' },
  inputArea: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', fontSize: '16px' },
  button: { padding: '10px 20px', backgroundColor: '#2c3e50', color: 'white', border: 'none', cursor: 'pointer' }
};
