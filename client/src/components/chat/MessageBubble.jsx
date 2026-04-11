const MessageBubble = ({ message, isMe }) => {
    return (
        <div className={`flex mb-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`
                relative max-w-[70%] px-3 py-2 rounded-2xl text-sm
                ${isMe
                    ? 'bg-teal-600 text-white rounded-br-sm'
                    : 'bg-[#1f2937] text-gray-100 rounded-bl-sm border border-white/5'
                }
            `}>
                {/* Message text */}
                <p className="leading-relaxed break-words">{message.text}</p>

                {/* Time + tick */}
                <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-[10px] ${isMe ? 'text-teal-200/70' : 'text-gray-500'}`}>
                        {message.time}
                    </span>

                    {/* Double tick for sent messages */}
                    {isMe && (
                        <svg className="w-3.5 h-3.5 text-teal-200/70" fill="currentColor" viewBox="0 0 16 11">
                            <path d="M11.071.653a.75.75 0 0 1 .025 1.06l-6.5 7a.75.75 0 0 1-1.085 0l-3-3.5a.75.75 0 1 1 1.138-.976l2.458 2.867 5.964-6.426a.75.75 0 0 1 1.06-.025h-.06Z"/>
                            <path d="M15.071.653a.75.75 0 0 1 .025 1.06l-6.5 7a.75.75 0 0 1-1.075.01L9.03 7.086l1.085-1.168.99 1.066 5.905-6.356a.75.75 0 0 1 1.06-.025h.001Z"/>
                        </svg>
                    )}
                </div>

                {/* Bubble tail */}
                {isMe ? (
                    <div className="absolute -right-1.5 bottom-0 w-3 h-3 overflow-hidden">
                        <div className="absolute bottom-0 right-1.5 w-3 h-3 bg-teal-600 rounded-bl-full" />
                    </div>
                ) : (
                    <div className="absolute -left-1.5 bottom-0 w-3 h-3 overflow-hidden">
                        <div className="absolute bottom-0 left-1.5 w-3 h-3 bg-[#1f2937] rounded-br-full" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;