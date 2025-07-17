import React from 'react';
import { User, FileText } from 'lucide-react';

const MessageBubble = ({ message, isUser }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'ml-2' : 'mr-2'}`}
             style={{ backgroundColor: isUser ? '#F5A623' : '#6B5B95' }}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <span className="text-white font-bold text-xs">IV</span>
          )}
        </div>

        {/* Message Content */}
        <div className={`rounded-lg px-4 py-2 shadow-sm transition-all duration-200 hover:shadow-md ${
          isUser ? 'rounded-br-none' : 'rounded-bl-none'
        }`}
        style={{ 
          backgroundColor: isUser ? '#F5A623' : '#6B5B95',
          color: 'white'
        }}>
          {/* File attachment indicator */}
          {message.fileName && (
            <div className="flex items-center space-x-2 mb-2 p-2 rounded bg-white bg-opacity-20">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">{message.fileName}</span>
            </div>
          )}
          
          {/* Message text */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          
          {/* Timestamp */}
          <div className="text-xs opacity-70 mt-1">
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;