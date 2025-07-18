import React, { useState, useEffect } from 'react';
import { User, FileText } from 'lucide-react';
import IndiflyLogo from './IndiflyLogo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const StreamingMessageBubble = ({ content = '', isComplete = false }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedContent(content);
    if (isComplete) {
      setIsTyping(false);
    }
  }, [content, isComplete]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex justify-start mb-6">
      <div className="flex max-w-[85%] flex-row items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md mr-3"
             style={{ backgroundColor: '#02295c' }}>
          <IndiflyLogo size="sm" />
        </div>

        {/* Message Content */}
        <div className="group relative">
          <div className="rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl bg-white text-gray-800 border border-gray-200">
            
            {/* Streaming Content */}
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
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
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold mb-2 text-gray-900">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-md font-semibold mb-2 text-gray-900">{children}</h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-200 pl-4 py-2 my-3 bg-blue-50 italic">
                      {children}
                    </blockquote>
                  ),
                  code: ({ inline, children }) => {
                    if (inline) {
                      return (
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-3">
                        <code className="text-sm font-mono">{children}</code>
                      </pre>
                    );
                  },
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-700">{children}</em>
                  ),
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      className="text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  )
                }}
              >
                {displayedContent}
              </ReactMarkdown>
              
              {/* Typing indicator */}
              {isTyping && (
                <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-400 mt-1 px-1">
            {formatTime(new Date())}
            {isTyping && (
              <span className="ml-2 text-blue-500">Typing...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingMessageBubble;
