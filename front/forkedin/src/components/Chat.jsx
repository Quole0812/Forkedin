import { useState } from "react";
import { ArrowUpward as ArrowIcon, Chat as ChatIcon, Close as CloseIcon } from "@mui/icons-material";
import "../styles/Chat.css";

import { getAuth } from "firebase/auth";




export default function Chat({ recipe }) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const toggleChat = () => setExpanded(prev => !prev);

const submitQuestion = async () => {
  if (!input.trim()) return;

  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in to chat.");
    return;
  }

  const token = await user.getIdToken();
  setMessages(prev => [...prev, { role: "user", content: input }]);
  setLoading(true);
  const userMessage = input;
  setInput("");

  try {
    const res = await fetch("http://localhost:5001/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: userMessage,
        recipe,
      }),
    });

    const data = await res.json();

    if (data.reply) {
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    }
  } catch (err) {
    console.error("Chat error:", err);
  } finally {
    setLoading(false);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submitQuestion();
  };

  return (
    <>
        {expanded ? (
            <div className="chat-window">
                <button 
                    className="chat-close-button" 
                    onClick={toggleChat}
                    aria-label="Close Chat"
                >
                    <CloseIcon fontSize="small" />
                </button>
                {/*handle initialize chat for recipes with no chat history*/}
                <p>This is where the chat is</p>
                    <div className="chat-log">
                        {messages.map((msg, idx) => (
                            <p key={idx} className={`chat-message ${msg.role}`}>
                            {msg.role === "assistant" ? "🤖 " : "🧑 "} {msg.content}
                            </p>
                        ))}
                    </div>
                <div className="chat-window-input">
                    <input
                    value={input}
                    placeholder="Ask a question"
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    />
                    {input && (
                    <button
                        className="chat-send-button"
                        aria-label="Send Message"
                        onClick={submitQuestion}
                    >
                        <ArrowIcon />
                    </button>
                    )}
                </div>
            </div>
        ) : (
        <button 
          className="chat-open-button" 
          onClick={toggleChat}
          aria-label="Open Chat"
        >
          <ChatIcon fontSize="medium" />
        </button>
      )}
    </>
  );
}
