import { useState } from "react";
import { ArrowUpward as ArrowIcon, Chat as ChatIcon, Close as CloseIcon } from "@mui/icons-material";
import "../styles/Chat.css";

export default function Chat({ recipe }) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");

  const toggleChat = () => setExpanded(prev => !prev);

  return (
    <>
      {expanded ? (
        <div className={`chat-window`}>
          <button 
            className="chat-close-button" 
            onClick={toggleChat}
            aria-label="Close Chat"
          >
            <CloseIcon fontSize="small" />
          </button>
          <p>This is your chat UI</p>
            <input 
                className='chat-window-input' 
                placeholder={`Ask a question`}
                onChange={(e) => setInput(e.target.value)}
            />

            {input && (
                <>
                    <button className="chat-send-button" aria-label="Send Message">
                        <ArrowIcon />
                    </button>
                </>
                
                
            )}
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
