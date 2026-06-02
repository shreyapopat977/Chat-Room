import { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useAuth } from '../../context/AuthContext';

const DateSeparator = ({ label }) => (
    <div className="flex items-center justify-center my-4">
        <span className="bg-[#1f2937] text-gray-400 text-xs px-3 py-1 rounded-full border border-white/10">
            {label}
        </span>
    </div>
);

const ChatWindow = ({ conversation, messages, onSendMessage, onOpenSidebar, onlineUsers = [] }) => {
    const { user } = useAuth();
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0f1e] text-center px-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg mb-4">
                    <span className="text-4xl">💬</span>
                </div>
                <h2 className="text-white text-xl font-semibold mb-2">Chat-Room</h2>
                <p className="text-gray-400 text-sm">
                    Select a conversation to start chatting
                </p>
            </div>
        );
    }

    // conversation.contact is the other user
    const contact = {
        ...conversation.contact,
        isOnline: onlineUsers.includes(conversation.contact?._id),
    };

    return (
        <div className="flex flex-col h-full">
            <ChatHeader
                contact={contact}
                onOpenSidebar={onOpenSidebar}
            />

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
                            No messages yet — say hello! 👋
                        </p>
                    </div>
                ) : (
                    <>
                        <DateSeparator label="Today" />
                        {messages.map((message) => (
                            <MessageBubble
                                key={message._id}
                                message={{
                                    ...message,
                                    text: message.text,
                                    time: new Date(message.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }),
                                }}
                                isMe={
                                    (message.senderId?._id || message.senderId)?.toString() ===
                                    user?.id?.toString()
                                }
                            />
                        ))}
                    </>
                )}
                <div ref={bottomRef} />
            </div>

            <MessageInput onSend={onSendMessage} />
        </div>
    );
};

export default ChatWindow;