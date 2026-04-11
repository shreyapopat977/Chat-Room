const ChatHeader = ({ contact, onOpenSidebar }) => {
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#111827] border-b border-white/10 flex-shrink-0">

            {/* Mobile back button */}
            <button
                onClick={onOpenSidebar}
                className="md:hidden text-gray-400 hover:text-white transition-colors mr-1"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <img
                    src={contact.avatar}
                    alt={contact.username}
                    className="w-10 h-10 rounded-full object-cover"
                />
                {contact.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#111827]" />
                )}
            </div>

            {/* Name + Status */}
            <div className="flex-1 min-w-0">
                <h2 className="text-white font-semibold text-sm truncate">
                    {contact.username}
                </h2>
                <p className="text-xs text-emerald-400">
                    {contact.isOnline ? 'Online' : 'Last seen recently'}
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="4" r="1.5" />
                        <circle cx="10" cy="10" r="1.5" />
                        <circle cx="10" cy="16" r="1.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;