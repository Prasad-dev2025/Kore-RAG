const BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1/ai`;

export const trainModelWithData = async (textContext) => {
    const response = await fetch(`${BASE_URL}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textContext }),
    });
    if (!response.ok) throw new Error('Ingestion processing failed. ');
    return response.text();
};

export const clearVectorIngestionData = async () => {
    const response = await fetch(`${BASE_URL}/clear-knowledge`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to flush server vector database layers.');
    return response.text();
}

export const fetchStreamingChat = async (messagePayload, onChunk, onError, onDone, signal) => {

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 5000);
    try {
        const response = await fetch(`${BASE_URL}/stream-chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messagePayload }),
            signal: signal || timeoutController.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Server socket pipe error.');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                onDone();
                break;
            }
            const textChunk = decoder.decode(value, { stream: true });
            onChunk(textChunk);
        }
    }
    catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            console.log('Stream generation succesfully halted by user.');
            onDone();
        }
        else {
            onError(err);
        }
    }
};