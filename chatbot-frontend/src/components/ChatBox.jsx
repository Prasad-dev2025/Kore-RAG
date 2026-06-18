import React, { useRef, useState, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import KnowledgeTrainer from './KnowledgeTrainer';
import ThinkingLoader from './ThinkingLoader';
import { fetchStreamingChat } from '../services/apiService';

export default function ChatBox({ messages, onMessagesUpdate }) {
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);


  const abortControllerRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setIsThinking(false);
  };

  const handleSendMessage = async (rawMessage) => {
    setLoading(true);
    setIsThinking(true);

    const userMessage = { sender: 'user', text: rawMessage };
    const tempAiId = Date.now();
    const initialAiMessage = { id: tempAiId, sender: 'ai', text: '' };

    onMessagesUpdate([...messages, userMessage, initialAiMessage]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedAiText = '';


    try {
      await fetchStreamingChat(
        rawMessage,
        (chunk) => {
          const lines = chunk.split('\n');
          let processedChunk = '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              processedChunk += line.slice(5);
            } else if (line.trim() !== '' && !line.startsWith('data:')) {
              processedChunk += line;
            }
          }

          if (processedChunk.trim().length > 0) {
            setIsThinking(false);
          }

          accumulatedAiText += processedChunk;

          onMessagesUpdate((currentHistory) =>
            currentHistory.map((m) => (m.id === tempAiId ? { ...m, text: accumulatedAiText } : m))
          );
        },
        (error) => {
          console.error("Streaming connection error:", error);
          setLoading(false);
          setIsThinking(false);
          alert("System Offline: Could not reach the AI backend.");
        },
        () => {
          setLoading(false);
          setIsThinking(false);
          abortControllerRef.current = null;
        },
        controller.signal
      );
    }
    catch (err) {
      console.log("CATCH BLOCK TRIGGERED:", err); 
      setLoading(false);
      setIsThinking(false);
      alert("Backend is offline or unreachable!");

      onMessagesUpdate((currentHistory) =>
        currentHistory.filter(m => m.id !== tempAiId)
      );
    }
  };

  return (
    <div style={{ width: '100%', fontFamily: 'Segoe UI, sans-serif' }}>
      <KnowledgeTrainer />

      <div style={{
        background: '#0f172a',
        borderRadius: '12px',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        boxShadow: '0 10px 15px -3px rgb(0,0,0/0.3)'
      }}>
        <div style={{ padding: '15px', borderBottom: '1px solid #334155', color: '#fff', fontWeight: 'bold' }}>
          🤖 Groq Cloud Real-Time Hub
        </div>

        <div
          className="chat-message-container"
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '15px'
          }}
        >
          {messages.map((m, idx) => (
            <ChatMessage key={m.id || idx} message={m} />
          ))}
          {isThinking && <ThinkingLoader />}
          <div ref={messageEndRef} />
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          onStopMessage={handleStopGeneration}
          isGenerating={loading}
        />
      </div>
    </div>
  );
}