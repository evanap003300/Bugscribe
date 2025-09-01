import React, { useEffect, useRef, useState } from 'react';

interface ChatboxProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const phrases = [
    "Squashing bugs...",
    "Untangling spaghetti code...",
    "Consulting the rubber duck...",
    "Chasing rogue semicolons...",
    "Checking for syntax ghosts...",
    "Searching for missing brackets..."
];

const Chatbox: React.FC<ChatboxProps> = ({ onSendMessage, isLoading }) => {
    const [message, setMessage] = useState<string>('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [loadingText, setLoadingText] = useState<string>("");

    useEffect(() => {
        if (isLoading) {
            const randomIndex = Math.floor(Math.random() * phrases.length);
            setLoadingText(phrases[randomIndex]);
        }
    }, [isLoading]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [message]);

    const handleSendClick = () => {
        if (message.trim() && !isLoading) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
        }
    };

    return (
        <div className="chat-input-container">
            <textarea
                ref={textareaRef}
                rows={1}
                className="chat-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? loadingText : "Debug anything"}
                disabled={isLoading}
            />
            <button
                className="send-button"
                onClick={handleSendClick}
                disabled={isLoading}
            >
                <svg xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="lucide lucide-arrow-up">
                    <path d="m5 12 7-7 7 7"/>
                    <path d="M12 19V5"/>
                </svg>
            </button>
        </div>
    );
};

export default Chatbox;