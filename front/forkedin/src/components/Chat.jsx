import { useState, useRef, useEffect } from "react";
import { ArrowUpward as ArrowIcon, Chat as ChatIcon, Close as CloseIcon, KeyboardArrowDown as DownArrowIcon } from "@mui/icons-material";
import "../styles/Chat.css";

import { getAuth } from "firebase/auth";

export default function Chat({ recipe }) {
    const [expanded, setExpanded] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const auth = getAuth();
    const chatLogRef = useRef(null);

    useEffect(() => {
        if (expanded && chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages, expanded]); 

    const toggleChat = async () => {
        if (isAnimating) return; // Prevent multiple clicks during animation
        
        setIsAnimating(true);
        
        const user = auth.currentUser;
        if (!expanded && user) {
            const token = await user.getIdToken();
            fetchChatHistory(user, token);
        }
        
        // Handle closing animation
        if (expanded) {
            // Add closing animation class
            const chatWindow = document.querySelector('.chat-window');
            if (chatWindow) {
                chatWindow.classList.add('chat-closing');
                setTimeout(() => {
                    setExpanded(false);
                    setIsAnimating(false);
                }, 300); // Match animation duration
            } else {
                setExpanded(false);
                setIsAnimating(false);
            }
        } else {
            // Opening the chat
            setExpanded(true);
            setTimeout(() => {
                const chatWindow = document.querySelector('.chat-window');
                if (chatWindow) {
                    chatWindow.classList.add('chat-opening');
                }
                setIsAnimating(false);
            }, 50);
        }
    };

    const submitQuestion = async () => {
        if (!input.trim() || loading) return;

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
        } 
        catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        } 
        finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitQuestion();
        }
    };

    const fetchChatHistory = async (user, token) => {
        try {
            const res = await fetch("http://localhost:5001/chat/history", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ recipe }),
            });

            const data = await res.json();
            if (data.messages) {
            setMessages(data.messages);
            }
        } 
        catch (err) {
            console.error("Failed to fetch chat history:", err);
        }
    };

    return (
        <>
            {/* Chat Window - only show when expanded */}
            {expanded && (
                <div className="chat-window chat-opening">
                    <div className="chat-header">
                        <h3 className="chat-title">Recipe Assistant</h3>
                        <button 
                            className="chat-close-button" 
                            onClick={toggleChat}
                            aria-label="Close Chat"
                            disabled={isAnimating}
                        >
                            <CloseIcon fontSize="small" />
                        </button>
                    </div>
                    
                    <div className="chat-log" ref={chatLogRef}>
                        {messages.length === 0 ? (
                            <div className="chat-message bot">
                                <p>Hello! I'm your recipe assistant. Ask me anything about "{recipe?.label || 'this recipe'}"!</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className={`chat-message ${msg.role === "assistant" ? "bot" : "user"}`}>
                                    {msg.content}
                                </div>
                            ))
                        )}
                        
                        {loading && (
                            <div className="typing-indicator">
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="chat-window-input">
                        <input
                            value={input}
                            placeholder="Ask about ingredients, cooking tips, or nutrition..."
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        {input.trim() && (
                            <button
                                className="chat-send-button"
                                aria-label="Send Message"
                                onClick={submitQuestion}
                                disabled={loading}
                            >
                                <ArrowIcon />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Chat Button - always visible, changes appearance based on state */}
            <button 
                className={`chat-open-button ${expanded ? 'chat-is-open' : ''}`}
                onClick={toggleChat}
                aria-label={expanded ? "Close Chat" : "Open Chat"}
                disabled={isAnimating}
            >
                {expanded ? <DownArrowIcon fontSize="medium" /> : <ChatIcon fontSize="medium" />}
            </button>
        </>
    );
}
