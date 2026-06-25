"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  message: string;
  document_type: string | null;
  fields: Record<string, string>;
  rendered_content: string | null;
  complete: boolean;
}

export interface ChatState {
  documentType: string | null;
  renderedContent: string | null;
  complete: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function ChatInterface({
  onStateUpdate,
}: {
  onStateUpdate: (state: ChatState) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function callApi(msgs: Message[]) {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs }),
    });
    return res.json() as Promise<ChatResponse>;
  }

  async function startChat() {
    setLoading(true);
    try {
      const data = await callApi([]);
      setMessages([{ role: "assistant", content: data.message }]);
      updateState(data);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const data = await callApi(newMessages);
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
      updateState(data);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function updateState(data: ChatResponse) {
    if (data.complete) setComplete(true);
    onStateUpdate({
      documentType: data.document_type,
      renderedContent: data.rendered_content,
      complete: data.complete,
    });
  }

  return (
    <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
                msg.role === "user" ? "text-white" : "bg-gray-100 text-gray-800"
              }`}
              style={msg.role === "user" ? { backgroundColor: "#209dd7" } : {}}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2.5">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}

        {complete && (
          <div className="text-center py-2">
            <span
              className="text-xs font-medium px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: "#ecad0a" }}
            >
              Document Complete
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            disabled={loading || complete}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || complete || !input.trim()}
            className="px-4 py-2 text-sm font-medium text-white rounded transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: "#753991" }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
