import React, { useState } from 'react'

export default function ChatInput({ onSendMessage, onStopMessage, isGenerating }) {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isGenerating) {
            onStopMessage();
        }
        else {
            if (!input.trim()) return;
            onSendMessage(input);
            setInput('');
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', padding: '15px', borderTop: '1px solid #334155' }}>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isGenerating ? "Qwen3 is typing... Hit Stop to write a new prompt" : "Type a prompt..."}
                disabled={isGenerating}
                style={{ flexGrow: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '15px', opacity: isGenerating ? 0.6 : 1, transition: 'opacity 0.2s' }}
            />
            <button type="submit"
                disabled={!isGenerating && !input.trim()}
                style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isGenerating ? '#ef4444' : '#147674',
                    color: '#fff',
                    fontSize: '15px',
                    cursor: (!isGenerating && !input.trim()) ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    boxShadow: isGenerating ? '0 4px 12px rgba(239,68,68,0.2' : 'none',
                    transition: 'all 0.2s ease-in-out'
                }}>
                {isGenerating ? '🛑 Stop' : '🚀 Send'}
            </button>

        </form>
    )
}
