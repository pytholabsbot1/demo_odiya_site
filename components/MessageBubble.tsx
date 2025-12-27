import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, Sparkles, FileText } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-8 animate-in slide-in-from-bottom-2 duration-300 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm ${
          isUser ? 'bg-gray-900 text-white' : 'bg-white border border-gray-100 text-brand-600'
        }`}>
          {isUser ? <User size={14} /> : <Sparkles size={14} />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-1 justify-end">
              {message.attachments.map((att, idx) => (
                <div key={idx} className="relative overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
                  {att.type === 'image' ? (
                    <img 
                      src={`data:${att.mimeType};base64,${att.data}`} 
                      alt={att.fileName} 
                      className="h-32 w-auto object-cover"
                    />
                  ) : (
                    <div className="h-16 w-32 flex items-center justify-center bg-gray-50 gap-2 p-2">
                      <FileText size={20} className="text-red-500" />
                      <span className="text-xs truncate max-w-[80px] text-gray-600 font-medium">{att.fileName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text Content */}
          <div className={`px-5 py-3.5 shadow-sm text-[15px] leading-relaxed overflow-hidden font-sans ${
            isUser 
              ? 'bg-gray-900 text-white rounded-2xl rounded-tr-sm' 
              : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
          }`}>
            {message.text ? (
              <ReactMarkdown 
                className={`prose prose-sm max-w-none break-words ${isUser ? 'prose-invert' : ''} prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0`}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              <span className="italic text-gray-400 text-xs">Thinking...</span>
            )}
            
            {message.isStreaming && (
               <span className="inline-block w-1.5 h-1.5 ml-2 rounded-full bg-brand-400 animate-ping"></span>
            )}
          </div>
          
          {/* Timestamp */}
          <div className="text-[10px] text-gray-300 px-1 opacity-60">
             {message.isError && <span className="text-red-500 mr-2 font-bold">Failed to send</span>}
             {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;