import React from 'react';
import { User, FileText, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from './ui/button';
import IndiflyLogo from './IndiflyLogo';

const MessageBubble = ({ message, isUser }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${isUser ? 'ml-3' : 'mr-3'}`}
             style={{ 
               backgroundColor: isUser ? '#fa6620' : '#02295c'
             }}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <IndiflyLogo size="sm" />
          )}
        </div>

        {/* Message Content */}
        <div className={`group relative`}>
          <div className={`rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl ${
            isUser 
              ? 'text-white' 
              : 'bg-white text-gray-800 border border-gray-200'
          }`}
          style={{
            backgroundColor: isUser ? '#fa6620' : 'white'
          }}>
            
            {/* File attachment indicator */}
            {message.fileName && (
              <div className={`flex items-center space-x-2 mb-3 p-3 rounded-xl ${
                isUser 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : 'border border-gray-100'
              }`}
              style={{
                backgroundColor: isUser ? 'rgba(255, 255, 255, 0.2)' : '#f8f9fa'
              }}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isUser ? 'bg-white/20' : ''
                }`}
                style={{
                  backgroundColor: isUser ? 'rgba(255, 255, 255, 0.2)' : '#02295c'
                }}>
                  <FileText className={`w-4 h-4 ${isUser ? 'text-white' : 'text-white'}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isUser ? 'text-white' : 'text-gray-900'}`}>
                    {message.fileName}
                  </p>
                  <p className={`text-xs ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
                    Document attached
                  </p>
                </div>
              </div>
            )}
            
            {/* Message text */}
            <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
              isUser ? 'text-white' : 'text-gray-800'
            }`}>
              {message.content}
            </div>
            
            {/* Timestamp */}
            <div className={`text-xs mt-2 ${
              isUser ? 'text-white/70' : 'text-gray-500'
            }`}>
              {formatTime(message.timestamp)}
            </div>
          </div>

          {/* Action buttons for bot messages */}
          {!isUser && (
            <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(message.content)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 h-auto"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-1 h-auto"
                style={{ '--hover-bg': '#fa6620' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fa6620'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-1 h-auto"
                style={{ '--hover-bg': '#dc2626' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <ThumbsDown className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;