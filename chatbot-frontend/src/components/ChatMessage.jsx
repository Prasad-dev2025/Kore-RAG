import React from 'react'

export default function ChatMessage({ message }) {
    const isUser = message.sender === 'user';
    if (!isUser && (!message.text || message.text.trim().length === 0)) {
        return null;
    }

    return (
        <div style={{ textAlign: isUser ? 'right' : 'left', margin: '14px 0' }}>
            <div style={{
                background: isUser ? '#147674' : '#1e293b',
                color: '#ffffff',
                padding: '12px 18px',
                borderRadius: isUser ? '25px' : '25px',
                display: 'inline-block',
                maxWidth: '75%',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
                <small style={{ display: 'block', color: '#94a3b8', marginBottom: '4px', fontSize: '11px' }}>
                    {isUser ? '' : 'Groq'}
                </small>
                <span style={{ whiteSpace: 'pre-line', fontSize: '15px' }}>{message.text}</span>

            </div>
        </div>
    )
}

