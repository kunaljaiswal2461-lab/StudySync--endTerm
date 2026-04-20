import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { addMessage } from '../services/roomService';
import { useRoomContext } from '../context/RoomContext';

const ChatPanel = ({ roomId, userId, userName }) => {
  const [text, setText] = useState('');
  const { messages } = useRoomContext();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const message = {
      text: text.trim(),
      senderId: userId,
      senderName: userName,
    };

    setText('');
    await addMessage(roomId, message);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-[#222222] overflow-hidden">
      <div className="p-6 border-b border-[#222222] bg-[#0f0f0f]">
        <h3 className="text-sm font-[600] text-[#ffffff] uppercase tracking-widest flex items-center gap-2">
          <MessageSquare size={16} className="text-[#ffffff]" /> Comms Channel
        </h3>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#050505]"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-8">
            <p className="text-xs font-[500] text-[#888888] uppercase tracking-widest">No incoming transmissions</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === userId;
            return (
              <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && (
                  <span className="text-[10px] font-[500] text-[#888888] uppercase tracking-widest mb-1 ml-1">
                    {msg.senderName}
                  </span>
                )}
                <div className={`max-w-[85%] px-4 py-3 text-sm ${
                  isMe 
                    ? 'bg-[#ffffff] text-[#000000] border border-[#ffffff]' 
                    : 'bg-[#111111] text-[#ffffff] border border-[#222222]'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-[#0f0f0f] border-t border-[#222222]">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Broadcast message..." 
            className="w-full bg-[#000000] border border-[#333333] px-4 py-3 pr-12 text-sm text-[#ffffff] placeholder-[#888888] focus:outline-none focus:border-[#555555] transition-colors"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#888888] hover:text-[#ffffff] transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
