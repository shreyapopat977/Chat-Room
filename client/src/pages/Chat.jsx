import { useState } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';

// Dummy data — baad mein API se aayega
const DUMMY_CONTACTS = [
    {
        id: '1',
        username: 'Rahul Sharma',
        avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=0d9488&color=fff',
        lastMessage: 'Haan bhai kal milte hain 👍',
        lastMessageTime: '10:42 AM',
        unreadCount: 2,
        isOnline: true,
    },
    {
        id: '2',
        username: 'Priya Patel',
        avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=7c3aed&color=fff',
        lastMessage: 'Code bhej dena please',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        isOnline: true,
    },
    {
        id: '3',
        username: 'Arjun Mehta',
        avatar: 'https://ui-avatars.com/api/?name=Arjun+Mehta&background=b45309&color=fff',
        lastMessage: 'Assignment done kar li?',
        lastMessageTime: 'Yesterday',
        unreadCount: 5,
        isOnline: false,
    },
    {
        id: '4',
        username: 'Sneha Joshi',
        avatar: 'https://ui-avatars.com/api/?name=Sneha+Joshi&background=be185d&color=fff',
        lastMessage: 'Thanks! 😊',
        lastMessageTime: 'Mon',
        unreadCount: 0,
        isOnline: false,
    },
    {
        id: '5',
        username: 'Dev Group 🚀',
        avatar: 'https://ui-avatars.com/api/?name=Dev+Group&background=1d4ed8&color=fff',
        lastMessage: 'Riya: PR merge kar diya',
        lastMessageTime: 'Mon',
        unreadCount: 12,
        isOnline: false,
    },
];

const DUMMY_MESSAGES = {
    '1': [
        { id: 'm1', text: 'Bhai project ka kya hua?', senderId: '1', time: '10:30 AM' },
        { id: 'm2', text: 'Chal raha hai, kal tak finish ho jaayega', senderId: 'me', time: '10:31 AM' },
        { id: 'm3', text: 'Kal presentation bhi hai na?', senderId: '1', time: '10:35 AM' },
        { id: 'm4', text: 'Haan, tension mat le sab ho jaayega', senderId: 'me', time: '10:38 AM' },
        { id: 'm5', text: 'Haan bhai kal milte hain 👍', senderId: '1', time: '10:42 AM' },
    ],
    '2': [
        { id: 'm1', text: 'Priya, middleware wala code dekha?', senderId: 'me', time: '9:00 AM' },
        { id: 'm2', text: 'Haan dekha, ek bug tha', senderId: '2', time: '9:05 AM' },
        { id: 'm3', text: 'Code bhej dena please', senderId: '2', time: '9:10 AM' },
    ],
    '3': [
        { id: 'm1', text: 'Bhai assignment done kar li?', senderId: '3', time: '8:00 PM' },
        { id: 'm2', text: 'Nahi yaar kal karni hai', senderId: 'me', time: '8:05 PM' },
    ],
    '4': [
        { id: 'm1', text: 'Notes share kar sakti ho?', senderId: 'me', time: 'Mon' },
        { id: 'm2', text: 'Thanks! 😊', senderId: '4', time: 'Mon' },
    ],
    '5': [
        { id: 'm1', text: 'Kaun PR review karega?', senderId: '2', time: '11:00 AM' },
        { id: 'm2', text: 'Main karta hoon', senderId: 'me', time: '11:05 AM' },
        { id: 'm3', text: 'PR merge kar diya', senderId: '2', time: '11:30 AM' },
    ],
};

const Chat = () => {
    const [selectedContact, setSelectedContact] = useState(DUMMY_CONTACTS[0]);
    const [messages, setMessages] = useState(DUMMY_MESSAGES);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const handleSendMessage = (text) => {
        if (!text.trim() || !selectedContact) return;

        const newMessage = {
            id: `m${Date.now()}`,
            text: text.trim(),
            senderId: 'me',
            time: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        setMessages((prev) => ({
            ...prev,
            [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage],
        }));
    };

    const handleSelectContact = (contact) => {
        setSelectedContact(contact);
        setIsMobileSidebarOpen(false);
    };

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
                    contacts={DUMMY_CONTACTS}
                    selectedContact={selectedContact}
                    onSelectContact={handleSelectContact}
                />
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col min-w-0">
                <ChatWindow
                    contact={selectedContact}
                    messages={messages[selectedContact?.id] || []}
                    onSendMessage={handleSendMessage}
                    onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                />
            </div>

            {/* Mobile overlay */}
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