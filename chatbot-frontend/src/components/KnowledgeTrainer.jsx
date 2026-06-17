import React, { useState, useRef } from 'react';
import { trainModelWithData, clearVectorIngestionData } from '../services/apiService';

export default function KnowledgeTrainer() {
    const [text, setText] = useState('');
    const [status, setStatus] = useState('');
    const [uploading, setuploading] = useState(false);
    const [clearing, setclearing] = useState(false);
    const fileInputRef = useRef(null);

    const handleTrainText = async () => {
        if (!text.trim()) return;
        setStatus('Converting to 1568-Dimension Vectors...');
        try {
            const result = await trainModelWithData(text);
            setStatus(result);
            setText('');

            setTimeout(() => {
                setStatus('');
            }, 4000);
        }
        catch (err) {
            setStatus('Ingestion process structural failure.');
        }
    };

    const handleFileUpload = async (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setStatus('⚠️ Extension Blocked: Please upload a valid PDF or DOCX file.');
            return;
        }

        setuploading(true);
        setStatus(`⚡ Ingesting "${selectedFile.name}" layers...`);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/ai/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const resultText = await response.text();
                setStatus(`✅ ${resultText}`);

                setTimeout(() => {
                    setStatus('');
                }, 4000);
            } else {
                const errText = await response.text();
                setStatus(`❌ Error:${errText}`);
            }
        } catch (err) {
            console.error(err);
            setStatus('❌ Network error. Check your Spring Boot server configuration.');
        } finally {
            setuploading(false);
            event.target.value = '';
        }
    };

    const handleClearKnowledge = async () => {
        if (!window.confirm("⚠️ Are you sure you want to completely wipe out all loaded document and text vector pieces?")) {
            return;
        }

        setclearing(true);
        setStatus('🧹 Sweeping and deleting vector store fragments...');

        try {
            const resultMsg = await clearVectorIngestionData();
            setStatus(`🗑️ ${resultMsg}`);
            setTimeout(() => {
                setStatus('');
            }, 4000);

        } catch (err) {
            console.error(err);
            setStatus('❌ Error: Failed to flush local vector database layers.');
            setTimeout(() => {
                setStatus('');
            }, 6000);

        } finally {
            setclearing(false);
        }
    };

    return (
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', color: '#fff', marginBottom: '20px', border: '1px solid #334155', fontFamily: 'Segoe UI,sans-serif ' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🧠 Vector Ingestion Console</h3>
            <textarea
                rows="3"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste contextual instructions or local platform logic profiles here..."
                style={{ width: '97%', padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', resize: 'none', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleTrainText} disabled={!text.trim() || uploading}
                    style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: (!text.trim() || uploading) ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: !text.trim() ? 0.6 : 1 }}>
                    Store to Cloud DB
                </button>

                <span style={{ color: '#475569', fontWeight: 'bold' }}>|</span>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx"
                    style={{ display: 'none' }}
                />
                <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                    style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '6px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                    {uploading ? 'parsing...' : '📁 Upload Doc (PDF,DOCX)'}
                </button>

                <button
                    onClick={handleClearKnowledge}
                    disabled={uploading || clearing}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        color: '#ef4444',
                        borderRadius: '6px',
                        cursor: (uploading || clearing) ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        marginLeft: 'auto',
                        opacity: (uploading || clearing) ? 0.5 : 1,
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { if (!uploading && !clearing) e.target.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                >
                    {clearing ? 'Brooming Vector Store...' : '🗑️ Clear Data'}
                </button>
            </div>

            {status && (
                <p style={{
                    fontSize: '13px',
                    color: status.includes('❌') || status.includes('⚠️') ? '#f87171' : '#a7f3d0',
                    marginTop: '12px',
                    marginBottom: '0',
                    background: '#0f172a',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #1e293b',
                    width: 'fit-content'
                }} >
                    {status}
                </p>
            )}
        </div>
    );
}
