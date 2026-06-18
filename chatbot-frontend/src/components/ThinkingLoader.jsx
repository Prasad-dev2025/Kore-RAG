import React from 'react';
import './ThinkingLoader.css';

export default function ThinkingLoader() {
  return (
    <div className="gemini-system-container">
      <div className="gemini-vector-stage">

        <div className="gemini-pulse-wave wave-initial"></div>
        <div className="gemini-pulse-wave wave-terminal"></div>

        <div className="gemini-physical-node node-apex"></div>
        <div className="gemini-physical-node node-left"></div>
        <div className="gemini-physical-node node-right"></div>
      </div>
      
      <span className="gemini-system-text">Thinking...</span>
    </div>
  );
}