import { useState } from 'react';

const MessageInput = ({ onSend }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text);
        setText('');
    };

    const handleKeyDown = (e) => {
        // Enter = send, Shift+Enter = new line
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex items-end gap-2 px-4 py-3 bg-[#111827] border-t border-white/10">

            {/* Emoji button */}
            <button className="flex-shrink-0 p-2 text-gray-400 hover:text-teal-400 transition-colors rounded-full hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
            </button>

            {/* Text area */}
            <div className="flex-1 bg-[#1f2937] border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-teal-500/50 transition-colors">
                <textarea
                    rows={1}
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        // Auto resize
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message"
                    className="w-full bg-transparent text-white text-sm placeholder-gray-500 outline-none resize-none leading-relaxed max-h-[120px] overflow-y-auto"
                    style={{ height: '24px' }}
                />
            </div>

            {/* Attachment button */}
            <button className="flex-shrink-0 p-2 text-gray-400 hover:text-teal-400 transition-colors rounded-full hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.47" />
                </svg>
            </button>

            {/* Send / Mic button */}
            {text.trim() ? (
                <button
                    onClick={handleSend}
                    className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                >
                    <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            ) : (
                <button className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-teal-500/20 active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default MessageInput;