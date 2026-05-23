import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Send, X, Trash2, Sparkles, Bot } from "lucide-react";

const suggestions = [
  "How to become AI engineer?",
  "What should I learn after React?",
  "Best roadmap for full stack dev",
  "How to prepare for placements?",
];

const Chatbot = ({ setChatOpen }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const token = localStorage.getItem("token");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchChat = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/chat", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchChat(); }, []);

  const sendMessage = async (customMessage) => {
    const msg = customMessage || input;
    if (!msg.trim()) return;

    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/chat",
        { message: msg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    if (!window.confirm("Clear all messages?")) return;
    try {
      await axios.delete("http://localhost:5000/api/chat", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .ck-chat * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .ck-chat pre { font-family: 'DM Mono', monospace; }

        .ck-root {
          background: #0f0f13;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.12);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* HEADER */
        .ck-header {
          background: linear-gradient(135deg, #1a1025 0%, #0f0f1a 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 13px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .ck-avatar {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 14px rgba(124,58,237,0.45); flex-shrink: 0;
        }
        .ck-status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22c55e; box-shadow: 0 0 6px #22c55e;
          animation: ck-pulse 2s ease-in-out infinite;
        }
        @keyframes ck-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.55; transform:scale(0.8); }
        }
        .ck-icon-btn {
          background: transparent; border: none; cursor: pointer;
          padding: 6px; border-radius: 8px; color: #5a5a8a;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .ck-icon-btn:hover { background: rgba(255,255,255,0.07); color: #9090c0; }

        /* MESSAGES */
        .ck-messages {
          flex: 1; overflow-y: auto; padding: 18px 14px;
          display: flex; flex-direction: column; gap: 14px;
          background: #0f0f13;
          scrollbar-width: thin; scrollbar-color: rgba(124,58,237,0.25) transparent;
        }
        .ck-messages::-webkit-scrollbar { width: 3px; }
        .ck-messages::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.25); border-radius: 4px; }

        /* BUBBLES */
        .ck-row-user { display:flex; justify-content:flex-end; gap:8px; }
        .ck-row-bot  { display:flex; justify-content:flex-start; gap:8px; align-items:flex-end; }

        .ck-bot-icon {
          width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, #7c3aed33, #4f46e533);
          border: 1px solid rgba(124,58,237,0.3);
          display: flex; align-items: center; justify-content: center;
        }

        .ck-bubble-user {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff; border-radius: 18px 18px 4px 18px;
          padding: 10px 14px; max-width: 78%; font-size: 13.5px;
          line-height: 1.65; box-shadow: 0 4px 16px rgba(124,58,237,0.28);
          animation: ck-in-right 0.2s ease;
        }
        .ck-bubble-bot {
          background: #1c1c28; color: #dcdcf0;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px 18px 18px 4px;
          padding: 10px 14px; max-width: 84%; font-size: 13.5px;
          line-height: 1.65; animation: ck-in-left 0.2s ease;
        }
        @keyframes ck-in-right { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes ck-in-left  { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }

        /* TYPING */
        .ck-typing {
          background: #1c1c28; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px 18px 18px 4px; padding: 12px 16px;
          display: flex; gap: 5px; align-items: center;
        }
        .ck-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #7c3aed;
          animation: ck-bounce 1.2s ease-in-out infinite;
        }
        .ck-dot:nth-child(2) { animation-delay: 0.2s; }
        .ck-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ck-bounce {
          0%,60%,100%{transform:translateY(0);opacity:0.35}
          30%{transform:translateY(-5px);opacity:1}
        }

        /* EMPTY STATE */
        .ck-empty {
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; flex:1; gap:18px; padding:20px 12px; text-align:center;
        }
        .ck-empty-icon {
          width:54px; height:54px; border-radius:16px;
          background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.15));
          border: 1px solid rgba(124,58,237,0.3);
          display:flex; align-items:center; justify-content:center;
        }
        .ck-chips { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-width:300px; }
        .ck-chip {
          background: #1a1a28; border: 1px solid rgba(124,58,237,0.22);
          color: #a78bfa; border-radius: 20px; padding: 7px 13px;
          font-size: 12px; cursor: pointer;
          transition: all 0.18s ease;
        }
        .ck-chip:hover {
          background: rgba(124,58,237,0.18); border-color: rgba(124,58,237,0.45);
          color: #c4b5fd; transform: translateY(-1px);
        }

        /* INPUT */
        .ck-input-area {
          background: #13131f; border-top: 1px solid rgba(255,255,255,0.055);
          padding: 11px 13px; display: flex; align-items: flex-end; gap: 9px;
          flex-shrink: 0;
        }
        .ck-textarea {
          flex: 1; background: #1c1c2e; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 9px 13px; color: #e0e0f0;
          font-size: 13.5px; outline: none; resize: none;
          font-family: 'DM Sans', sans-serif; line-height: 1.5;
          transition: border-color 0.2s, box-shadow 0.2s;
          max-height: 100px; overflow-y: auto;
        }
        .ck-textarea::placeholder { color: #3e3e60; }
        .ck-textarea:focus {
          border-color: rgba(124,58,237,0.45);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .ck-send {
          width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.18s ease;
          box-shadow: 0 4px 12px rgba(124,58,237,0.35);
        }
        .ck-send:hover:not(:disabled) { transform:scale(1.06); box-shadow: 0 6px 18px rgba(124,58,237,0.5); }
        .ck-send:active:not(:disabled) { transform:scale(0.95); }
        .ck-send:disabled { opacity:0.35; cursor:not-allowed; }
      `}</style>

      <div className="ck-chat ck-root">

        {/* HEADER */}
        <div className="ck-header">
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div className="ck-avatar">
              <Bot size={15} color="#fff" />
            </div>
            <div>
              <div style={{ color:"#e2e2f0", fontWeight:600, fontSize:"14px", lineHeight:1.2 }}>
                CareerKraft AI
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"5px", marginTop:"3px" }}>
                <div className="ck-status-dot" />
                <span style={{ color:"#22c55e", fontSize:"11px", fontWeight:500 }}>Online</span>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:"2px" }}>
            <button className="ck-icon-btn" onClick={clearChat} title="Clear chat">
              <Trash2 size={14} />
            </button>
            <button className="ck-icon-btn" onClick={() => setChatOpen(false)} title="Close">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="ck-messages">

          {messages.length === 0 && (
            <div className="ck-empty">
              <div className="ck-empty-icon">
                <Sparkles size={22} color="#a78bfa" />
              </div>
              <div>
                <p style={{ color:"#e2e2f0", fontWeight:600, fontSize:"15px", marginBottom:"5px" }}>
                  Ask me anything
                </p>
                <p style={{ color:"#4a4a6a", fontSize:"12.5px", lineHeight:1.6 }}>
                  Career guidance, learning paths, tech advice — I've got you.
                </p>
              </div>
              <div className="ck-chips">
                {suggestions.map((s, i) => (
                  <button key={i} className="ck-chip" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            msg.role === "user" ? (
              <div key={i} className="ck-row-user">
                <div className="ck-bubble-user">
                  <pre className="whitespace-pre-wrap" style={{ margin:0, fontSize:"13.5px", lineHeight:1.65 }}>
                    {msg.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div key={i} className="ck-row-bot">
                <div className="ck-bot-icon">
                  <Bot size={12} color="#a78bfa" />
                </div>
                <div className="ck-bubble-bot">
                  <pre className="whitespace-pre-wrap" style={{ margin:0, fontSize:"13.5px", lineHeight:1.65 }}>
                    {msg.content}
                  </pre>
                </div>
              </div>
            )
          ))}

          {loading && (
            <div className="ck-row-bot">
              <div className="ck-bot-icon">
                <Bot size={12} color="#a78bfa" />
              </div>
              <div className="ck-typing">
                <div className="ck-dot" />
                <div className="ck-dot" />
                <div className="ck-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="ck-input-area">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={handleKeyDown}
            className="ck-textarea"
          />
          <button
            className="ck-send"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            <Send size={14} color="#fff" />
          </button>
        </div>

      </div>
    </>
  );
};

export default Chatbot;