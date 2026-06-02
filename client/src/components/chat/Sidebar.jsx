import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const Sidebar = ({
    conversations = [],
    selectedConversation,
    onlineUsers = [],
    onSelectConversation,
    onStartChat,
}) => {
    const { user, logout } = useAuth();
    const [search, setSearch] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [showNewChat, setShowNewChat] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const filtered = conversations.filter((conv) =>
        conv.contact?.username?.toLowerCase().includes(search.toLowerCase())
    );

    const handleUserSearch = async (q) => {
        setUserSearch(q);
        if (!q.trim()) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const { data } = await api.get(`/users/search?q=${q}`);
            setSearchResults(data);
        } catch (err) {
            console.error('User search error:', err);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectUser = (userId) => {
        onStartChat(userId);
        setShowNewChat(false);
        setUserSearch('');
        setSearchResults([]);
    };

    return (
        <div className="flex flex-col w-full h-full bg-[#111827] relative">

            {/* ── Top Bar ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=0d9488&color=fff`}
                        alt="me"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-white font-semibold text-sm">{user?.username}</span>
                </div>

                <div className="flex items-center gap-1">
                    {/* New Chat button */}
                    <button
                        onClick={() => setShowNewChat(true)}
                        title="New Chat"
                        className="text-gray-400 hover:text-teal-400 transition-colors p-1.5 rounded-full hover:bg-white/10"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>

                    {/* Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="4" r="1.5" />
                                <circle cx="10" cy="10" r="1.5" />
                                <circle cx="10" cy="16" r="1.5" />
                            </svg>
                        </button>

                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 top-9 z-20 bg-[#1f2937] border border-white/10 rounded-xl shadow-xl py-1 w-40">
                                    <button
                                        onClick={() => { logout(); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Search existing conversations ── */}
            <div className="px-3 py-3 border-b border-white/10">
                <div className="relative">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search conversations"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#1f2937] text-white text-sm placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 outline-none border border-white/10 focus:border-teal-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* ── Conversation List ── */}
            <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm mt-10 px-4">
                        {conversations.length === 0 ? (
                            <span>
                                No conversations yet.<br />
                                Click <strong className="text-teal-400">+</strong> to start one.
                            </span>
                        ) : 'No results found'}
                    </div>
                ) : (
                    filtered.map((conv) => (
                        <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isSelected={selectedConversation?.id === conv.id}
                            isOnline={onlineUsers.includes(conv.contact?._id)}
                            onClick={() => onSelectConversation(conv)}
                        />
                    ))
                )}
            </div>

            {/* ── New Chat Panel ── */}
            {showNewChat && (
                <div className="absolute inset-0 z-30 bg-[#111827] flex flex-col">

                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0">
                        <button
                            onClick={() => {
                                setShowNewChat(false);
                                setUserSearch('');
                                setSearchResults([]);
                            }}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h2 className="text-white font-semibold text-sm">New Chat</h2>
                    </div>

                    {/* Search users input */}
                    <div className="px-3 py-3 flex-shrink-0">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search users by username..."
                            value={userSearch}
                            onChange={(e) => handleUserSearch(e.target.value)}
                            className="w-full bg-[#1f2937] text-white text-sm placeholder-gray-500 rounded-xl px-4 py-2.5 outline-none border border-white/10 focus:border-teal-500/50 transition-colors"
                        />
                    </div>

                    {/* Results */}
                    <div className="flex-1 overflow-y-auto">
                        {searching && (
                            <div className="flex items-center justify-center mt-8">
                                <svg className="animate-spin h-5 w-5 text-teal-400" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            </div>
                        )}

                        {!searching && !userSearch && (
                            <div className="text-center text-gray-500 text-sm mt-8 px-4">
                                Type a username to search
                            </div>
                        )}

                        {!searching && userSearch && searchResults.length === 0 && (
                            <div className="text-center text-gray-500 text-sm mt-8 px-4">
                                No users found for "{userSearch}"
                            </div>
                        )}

                        {!searching && searchResults.map((u) => (
                            <button
                                key={u._id}
                                onClick={() => handleSelectUser(u._id)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 text-left"
                            >
                                <img
                                    src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random`}
                                    alt={u.username}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                                <div>
                                    <p className="text-white text-sm font-medium">{u.username}</p>
                                    <p className="text-gray-500 text-xs">
                                        {onlineUsers.includes(u._id) ? '🟢 Online' : 'Offline'}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Single conversation row ──
const ConversationItem = ({ conversation, isSelected, isOnline, onClick }) => {
    const { contact, lastMessage, unreadCount, updatedAt } = conversation;

    const timeLabel = updatedAt
        ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-white/5 text-left
                ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <img
                    src={contact?.avatar || `https://ui-avatars.com/api/?name=${contact?.username}&background=random`}
                    alt={contact?.username}
                    className="w-12 h-12 rounded-full object-cover"
                />
                {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#111827]" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-white text-sm font-semibold truncate">
                        {contact?.username}
                    </span>
                    <span className="text-gray-500 text-xs flex-shrink-0 ml-2">
                        {timeLabel}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs truncate">
                        {lastMessage?.text || 'Start a conversation'}
                    </span>
                    {unreadCount > 0 && (
                        <span className="ml-2 bg-teal-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};

export default Sidebar;