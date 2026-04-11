import { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

// Date separator component
const DateSeparator = ({ label }) => (
    <div className="flex items-center justify-center my-4">
        <span className="bg-[#1f2937] text-gray-400 text-xs px-3 py-1 rounded-full border border-white/10">
            {label}
        </span>
    </div>
);

const ChatWindow = ({ contact, messages, onSendMessage, onOpenSidebar }) => {
    const bottomRef = useRef(null);

    // Scroll to bottom jab bhi naya message aaye
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!contact) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0f1e] text-center px-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg mb-4">
                    <span className="text-4xl">💬</span>
                </div>
                <h2 className="text-white text-xl font-semibold mb-2">Chat-Room</h2>
                <p className="text-gray-400 text-sm">
                    Kisi contact pe click karo aur baat shuru karo
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">

            {/* Header */}
            <ChatHeader
                contact={contact}
                onOpenSidebar={onOpenSidebar}
            />

            {/* Messages Area */}
            <div
                className="flex-1 overflow-y-auto px-4 py-4"
                style={{
                    background: `
                        radial-gradient(ellipse at 20% 50%, rgba(13, 148, 136, 0.03) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 20%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
                        #0a0f1e
                    `
                }}
            >
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-sm">
                            Abhi koi message nahi — pehla message bhejo! 👋
                        </p>
                    </div>
                ) : (
                    <>
                        <DateSeparator label="Today" />
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isMe={message.senderId === 'me'}
                            />
                        ))}
                    </>
                )}

                {/* Scroll anchor */}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <MessageInput onSend={onSendMessage} />
        </div>
    );
};

export default ChatWindow;