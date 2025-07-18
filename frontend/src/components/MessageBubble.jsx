import React from 'react';
import { User, FileText, Copy } from 'lucide-react';
import { Button } from './ui/button';
import IndiflyLogo from './IndiflyLogo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
            <div className={`text-sm leading-relaxed ${
              isUser ? 'text-white' : 'text-gray-800'
            }`}>
              {isUser ? (
                // For user messages, just show plain text
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                // For AI messages, render markdown
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom styling for markdown elements to match chat theme
                      p: ({children}) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                      li: ({children}) => <li className="leading-relaxed">{children}</li>,
                      h1: ({children}) => <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>,
                      h2: ({children}) => <h2 className="text-lg font-bold mb-2 text-gray-900">{children}</h2>,
                      h3: ({children}) => <h3 className="text-md font-semibold mb-2 text-gray-900">{children}</h3>,
                      strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-200 pl-4 py-2 my-3 bg-blue-50 italic">
                          {children}
                        </blockquote>
                      ),
                      code: ({inline, children}) => {
                        if (inline) {
                          return (
                            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600">
                              {children}
                            </code>
                          );
                        }
                        return (
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg my-3 overflow-x-auto">
                            <code className="text-sm font-mono">{children}</code>
                          </pre>
                        );
                      },
                      // Table components with horizontal scroll
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-gray-50">{children}</thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
                      ),
                      th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 last:border-r-0">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;