import { useState } from 'react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      // Call your Express Backend
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error("Error:", error);
      setResponse("Failed to fetch response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>🤖 AI Chatbot</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask something..."
          rows="4"
          cols="50"
          style={{ width: '100%', padding: '10px' }}
        />
        <br />
        <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '10px 20px' }}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
          <strong>AI says:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;
