import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { useSocket } from '../../hooks/useSocket';
import api from '../api/axios';

const Chat = () => {
    const { socket, onlineUsers } = useSocket();

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // ─── Conversations load karo ───────────────────────
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

    // ─── Socket events listen karo ────────────────────
    useEffect(() => {
        if (!socket) return;

        // Naya message aaya
        socket.on('receiveMessage', ({ conversationId, message }) => {
            // Agar current conversation mein aaya
            if (selectedConversation?._id === conversationId) {
                setMessages((prev) => [...prev, message]);
            }

            // Sidebar update karo — lastMessage
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === conversationId
                        ? {
                              ...conv,
                              lastMessage: { text: message.text, createdAt: message.createdAt },
                          }
                        : conv
                )
            );
        });

        // Notification — dusri conversation mein message aaya
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

    // ─── Contact select karo ──────────────────────────
    const handleSelectConversation = useCallback(
        async (conversation) => {
            // Pehli conversation se leave karo
            if (selectedConversation) {
                socket?.emit('leaveConversation', selectedConversation._id);
            }

            setSelectedConversation(conversation);
            setIsMobileSidebarOpen(false);
            setLoadingMessages(true);

            try {
                // Messages fetch karo
                const { data } = await api.get(`/messages/${conversation._id}`);
                setMessages(data.messages);

                // Socket room join karo
                socket?.emit('joinConversation', conversation._id);

                // Unread count 0 karo
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === conversation._id
                            ? { ...conv, unreadCount: 0 }
                            : conv
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

    // ─── Message bhejo ────────────────────────────────
    const handleSendMessage = useCallback(
        (text) => {
            if (!text.trim() || !selectedConversation || !socket) return;

            socket.emit('sendMessage', {
                conversationId: selectedConversation._id,
                text: text.trim(),
            });
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