import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Chat = () => {
    const { socket, onlineUsers } = useSocket();
    const { user } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // ─── Fetch conversations on mount ─────────────────
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { data } = await api.get('/conversations');
                setConversations(data);
            } catch (err) {
                console.error('Conversations fetch failed:', err);
            }
        };
        fetchConversations();
    }, []);

    // ─── Socket events ────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        socket.on('receiveMessage', ({ conversationId, message }) => {
            if (selectedConversation?.id === conversationId) {
                setMessages((prev) => [...prev, message]);
            }

            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === conversationId
                        ? { ...conv, lastMessage: { text: message.text, createdAt: message.createdAt } }
                        : conv
                )
            );
        });

        socket.on('newMessageNotification', ({ conversationId }) => {
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === conversationId
                        ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
                        : conv
                )
            );
        });

        return () => {
            socket.off('receiveMessage');
            socket.off('newMessageNotification');
        };
    }, [socket, selectedConversation]);

    // ─── Select a conversation ────────────────────────
    const handleSelectConversation = useCallback(
        async (conversation) => {
            if (selectedConversation) {
                socket?.emit('leaveConversation', selectedConversation._id || selectedConversation.id);
            }

            setSelectedConversation(conversation);
            setIsMobileSidebarOpen(false);
            setLoadingMessages(true);

            try {
                const convId = conversation._id || conversation.id;
                const { data } = await api.get(`/messages/${convId}`);
                setMessages(data.messages);

                socket?.emit('joinConversation', convId);

                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
                    )
                );
            } catch (err) {
                console.error('Messages fetch failed:', err);
            } finally {
                setLoadingMessages(false);
            }
        },
        [socket, selectedConversation]
    );

    // ─── Start new conversation ───────────────────────
    const handleStartChat = useCallback(async (userId) => {
        try {
            const { data } = await api.get(`/conversations/${userId}`);

            const myId = user?.id || user?._id;
            const otherUser = data.participants.find(
                (p) => p._id.toString() !== myId.toString()
            );

            const conv = {
                id: data._id,
                _id: data._id,
                contact: otherUser,
                lastMessage: data.lastMessage || null,
                unreadCount: 0,
                updatedAt: data.updatedAt,
            };

            setConversations((prev) => {
                const exists = prev.find((c) => c.id === conv.id);
                if (exists) return prev;
                return [conv, ...prev];
            });

            handleSelectConversation(conv);
        } catch (err) {
            console.error('Start chat failed:', err);
        }
    }, [user, handleSelectConversation]);

    // ─── Send message ─────────────────────────────────
    const handleSendMessage = useCallback(
        (text) => {
            if (!text.trim() || !selectedConversation || !socket) return;
            const convId = selectedConversation._id || selectedConversation.id;
            socket.emit('sendMessage', { conversationId: convId, text: text.trim() });
        },
        [socket, selectedConversation]
    );

    return (
        <div className="flex h-screen bg-[#0a0f1e] overflow-hidden">
            {/* Sidebar */}
            <div className={`
                ${isMobileSidebarOpen ? 'flex' : 'hidden'}
                md:flex
                w-full md:w-[340px] lg:w-[380px]
                flex-shrink-0
                border-r border-white/10
                absolute md:relative z-20 h-full
            `}>
                <Sidebar
                    conversations={conversations}
                    selectedConversation={selectedConversation}
                    onlineUsers={onlineUsers}
                    onSelectConversation={handleSelectConversation}
                    onStartChat={handleStartChat}
                />
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col min-w-0">
                <ChatWindow
                    conversation={selectedConversation}
                    messages={messages}
                    loading={loadingMessages}
                    onlineUsers={onlineUsers}
                    onSendMessage={handleSendMessage}
                    onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                    socket={socket}
                />
            </div>

            {isMobileSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-10"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Chat;