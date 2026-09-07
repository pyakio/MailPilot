import { useState, useCallback } from 'react';
import apiClient from '../lib/axios';

export function useAssistant() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    async (content, provider) => {
      if (!content || !content.trim()) return;
      const userMsg = { role: 'user', content: content.trim() };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setLoading(true);
      setError(null);

      try {
        const data = await apiClient.post('/ai/assistant', { messages: updated, provider });
        const reply = data?.reply ?? data;
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: typeof reply === 'string' ? reply : JSON.stringify(reply) },
        ]);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, setMessages, sendMessage, clearMessages, loading, error };
}

export default useAssistant;
