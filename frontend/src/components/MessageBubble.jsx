import React from 'react';
import { User, FileText, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from './ui/button';

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
               background: isUser 
                 ? 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)' 
                 : 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)'
             }}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">i</span>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`group relative`}>
          <div className={`rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl ${
            isUser 
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' 
              : 'bg-white text-gray-800 border border-gray-200'
          }`}>
            
            {/* File attachment indicator */}
            {message.fileName && (
              <div className={`flex items-center space-x-2 mb-3 p-3 rounded-xl ${
                isUser 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : 'bg-gray-50 border border-gray-100'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isUser ? 'bg-white/20' : 'bg-blue-50'
                }`}>
                  <FileText className={`w-4 h-4 ${isUser ? 'text-white' : 'text-blue-600'}`} />
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
                className="text-gray-400 hover:text-green-600 hover:bg-green-50 p-1 h-auto"
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 h-auto"
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