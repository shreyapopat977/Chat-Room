import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ contacts, selectedContact, onSelectContact }) => {
    const { user, logout } = useAuth();
    const [search, setSearch] = useState('');
    const [showMenu, setShowMenu] = useState(false);

    const filtered = contacts.filter((c) =>
        c.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col w-full h-full bg-[#111827]">

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
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
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

            {/* ── Search ── */}
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
                        placeholder="Search or start new chat"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#1f2937] text-white text-sm placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 outline-none border border-white/10 focus:border-teal-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* ── Contact List ── */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {filtered.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm mt-10">
                        Koi contact nahi mila
                    </div>
                ) : (
                    filtered.map((contact) => (
                        <ContactItem
                            key={contact.id}
                            contact={contact}
                            isSelected={selectedContact?.id === contact.id}
                            onClick={() => onSelectContact(contact)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// ── Single contact row ──
const ContactItem = ({ contact, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-white/5 text-left
                ${isSelected
                    ? 'bg-white/10'
                    : 'hover:bg-white/5'
                }`}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <img
                    src={contact.avatar}
                    alt={contact.username}
                    className="w-12 h-12 rounded-full object-cover"
                />
                {contact.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#111827]" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-white text-sm font-semibold truncate">
                        {contact.username}
                    </span>
                    <span className="text-gray-500 text-xs flex-shrink-0 ml-2">
                        {contact.lastMessageTime}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs truncate">
                        {contact.lastMessage}
                    </span>
                    {contact.unreadCount > 0 && (
                        <span className="ml-2 bg-teal-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};

export default Sidebar;