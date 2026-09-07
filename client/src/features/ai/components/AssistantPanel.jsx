import { useState, useRef, useEffect } from "react";
import { useAssistant } from "../../../hooks/useAssistant";

export default function AssistantPanel({ defaultProvider = "openai" }) {
  const { messages, sendMessage, loading, error, clearMessages } = useAssistant();
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState(defaultProvider);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input, provider);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      {/* Header with Provider Selector */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-base">AI Copilot Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 outline-none"
          >
            <option value="openai">OpenAI (GPT-4o mini)</option>
            <option value="gemini">Google (Gemini 2.0 Flash)</option>
          </select>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded"
              title="Clear chat"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[320px] max-h-[500px] p-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-400 dark:text-slate-500">
            <p className="text-sm font-medium">How can I assist your email campaigns today?</p>
            <p className="text-xs mt-1">Ask for copywriting, deliverability tips, or strategy.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              Thinking...
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-lg text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the assistant..."
          disabled={loading}
          className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}
