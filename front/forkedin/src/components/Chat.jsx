import { useState } from "react";
import { Chat as ChatIcon, Close as CloseIcon } from "@mui/icons-material";
import "../styles/Chat.css";

export default function Chat() {
  const [expanded, setExpanded] = useState(false);

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
