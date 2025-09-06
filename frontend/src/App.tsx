import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import Chatbox from './components/Chatbox';
import './index.css';
import { sendMessage } from './services/api';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'llm';
}

const phrases = [
    "Squashing bugs...",
    "Untangling spaghetti code...",
    "Consulting the rubber duck...",
    "Chasing rogue semicolons...",
    "Checking for syntax ghosts...",
    "Searching for missing brackets..."
];

const getDelayForChar = (char: string): number => {
    const base = 5; // base speed (ms per char)
    const jitter = Math.random() * 30; // random variation (0–30ms)

    if (char === ' ') return 10 + jitter; // short pause at spaces
    if (/[.,!?]/.test(char)) return 120 + jitter; // longer pause at punctuation
    return base + jitter;
};

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingText, setLoadingText] = useState<string>('');
    const [streamingText, setStreamingText] = useState<string>(''); // buffer for typing effect

    const handleSendMessage = async (text: string) => {
        const newUserMessage: Message = { id: messages.length + 1, text, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);

        const randomIndex = Math.floor(Math.random() * phrases.length);
        setLoadingText(phrases[randomIndex]);
        setIsLoading(true);

        try {
            const response = await sendMessage({ message: text });

            setStreamingText('');
            let i = 0;

            const typeNextChar = () => {
                if (i < response.length) {
                    const char = response[i];
                    setStreamingText((prev) => prev + char);
                    i++;

                    setTimeout(typeNextChar, getDelayForChar(char));
                } else {
                    const newLLMMessage: Message = {
                        id: messages.length + 2,
                        text: response,
                        sender: 'llm',
                    };
                    setMessages((prevMessages) => [...prevMessages, newLLMMessage]);
                    setStreamingText('');
                    setIsLoading(false);
                }
            };

            typeNextChar(); // start typing

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: messages.length + 2,
                text: 'Error: Could not get a response.',
                sender: 'llm',
            };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="logo-placeholder">BugScribe</div>
                <header>
                    <SignedOut>
                        <SignInButton />
                        <SignUpButton />
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </header>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message-bubble ${msg.sender === 'user' ? 'user-message' : 'llm-message'}`}
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>
                ))}

                {/* Streaming LLM message */}
                {streamingText && (
                    <div className="llm-message">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {streamingText}
                        </ReactMarkdown>
                    </div>
                )}

                {/* Loading animation */}
                {isLoading && !streamingText && (
                    <div className="loading-animation">
                        <div className="spinner"></div>
                        <div className="loading-text">
                            {loadingText.split('').map((char, index) => (
                                <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Input */}
            <Chatbox onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
    );
};

export default App;