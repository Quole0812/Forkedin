import { useState } from "react";
import { ArrowUpward as ArrowIcon, Chat as ChatIcon, Close as CloseIcon } from "@mui/icons-material";
import "../styles/Chat.css";

export default function Chat({ recipe }) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setExpanded(prev => !prev);

  const submitQuestion = () => {
    if (!input.trim()) return;
    setMessages(prev => [...messages, input]);
    setInput("");
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
                            <p key={idx} className="chat-message">{msg}</p>
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
