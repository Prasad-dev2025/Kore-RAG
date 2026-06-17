import React, { useState, useEffect, useMemo } from 'react';
import ChatBox from './components/ChatBox';

function App() {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('ai_chat_sessions');
    return saved ? JSON.parse(saved) : [{ id: Date.now(), title: 'New Chat Session', messages: [] }];
  });

  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  useEffect(() => {
    localStorage.setItem('ai_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const handleCreateNewChat = () => {
    if (activeSession && activeSession.messages.length === 0) {
      setIsSidebarOpen(false);
      return;
    }

    const newSession = {
      id: Date.now(),
      title: 'New Chat Session',
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = (id, e) => {
    e.stopPropagation();

    let newSessions = sessions.filter(s => s.id !== id);

    // If list is empty, create a truly new session with a new ID
    if (newSessions.length === 0) {
      const newId = Date.now();
      setSessions([{ id: newId, title: 'New Chat Session', messages: [] }]);
      setActiveSessionId(newId); // Force ID change
      return;
    }

    setSessions(newSessions);

    // If the deleted session was the active one, switch to the first remaining one
    if (activeSessionId === id) {
      setActiveSessionId(newSessions[0].id); // Force ID change
    }
  };

  // FIXED: This now accepts a callback function or a direct array, making it 100% safe for streams
  const updateActiveSessionMessages = (messagesOrUpdater) => {
    setSessions(prevSessions => prevSessions.map(
      session => {
        if (session.id === activeSessionId) {
          // Resolve the new messages array if an updater function was passed
          const newMessages = typeof messagesOrUpdater === 'function'
            ? messagesOrUpdater(session.messages)
            : messagesOrUpdater;

          let updatedTitle = session.title;
          if (session.title === 'New Chat Session' && newMessages.length > 0) {
            const firstUserMsg = newMessages.find(m => m.sender === 'user');
            if (firstUserMsg) {
              updatedTitle = firstUserMsg.text.length > 22
                ? firstUserMsg.text.substring(0, 20) + '...'
                : firstUserMsg.text;
            }
          }
          return { ...session, title: updatedTitle, messages: newMessages };
        }
        return session;
      }
    ));
  };

  const sidebarContainerStyle = {
    background: '#0f172a',
    borderRight: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    padding: '15px 10px',
    boxSizing: 'border-box',
    zIndex: 1000,
    flex: '0 0 260px',
    width: '260px',
    height: '100%',

    ...(isMobile ? {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease',
      boxShadow: isSidebarOpen ? '10px 0 25px rgba(0,0,0,0.5)' : 'none',
    } : {
      transform: 'none',
      position: 'relative'
    })
  };

  const overlayStyle = {
    display: isMobile && isSidebarOpen ? 'block' : 'none',
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(2px)',
    zIndex: 999,
  };

  const mobileHeaderStyle = {
    display: isMobile ? 'flex' : 'none',
    background: '#0f172a',
    borderBottom: '1px solid #1e293b',
    padding: '12px 20px',
    alignItems: 'center',
    gap: '15px',
    color: 'white',
    flexShrink: 0,
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', backgroundColor: '#020617', fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden' }}>

      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
        * { scrollbar-width: thin; scrollbar-color: #334155 transparent; }
      `}</style>

      <div style={overlayStyle} onClick={() => setIsSidebarOpen(false)} />

      <div style={sidebarContainerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={handleCreateNewChat}
            style={{
              flexGrow: 1,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(59,130,246,0.2)'
            }}
          >
            ➕ New Chat
          </button>

          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer', paddingLeft: '10px' }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ color: '#475569', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', paddingLeft: '8px', marginBottom: '8px', letterSpacing: '0.5px' }}>
          Recent Threads
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: isActive ? '#1e293b' : 'transparent',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', marginRight: '8px' }}>
                  💬 {session.title}
                </div>
                <span
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  style={{ color: '#64748b', fontSize: '12px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}
                  onMouseEnter={(e) => (e.target.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.target.style.color = '#64748b')}
                  title="Delete chat Thread"
                >
                  🗑️
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <div style={mobileHeaderStyle}>
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>🤖 Kore RAG</span>
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '15px' }}>
          <div style={{ width: '100%', height: '100%' }}>
            {/* CHANGED: We pass down the direct session messages array, and the update function */}
            <ChatBox
              key={activeSessionId}
              messages={activeSession?.messages || []}
              onMessagesUpdate={updateActiveSessionMessages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;