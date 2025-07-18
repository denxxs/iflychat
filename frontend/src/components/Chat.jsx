import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Send, Menu, Paperclip, MoreVertical, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import Loader from './Loader';
import FileUpload from './FileUpload';
import IndiflyLogo from './IndiflyLogo';

const Chat = ({ 
  activeChat, 
  onSendMessage, 
  onToggleSidebar, 
  onNewChat,
  isMobile = false,
  sidebarOpen = true 
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isLoading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const messageText = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      await onSendMessage({ content: messageText }, []);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || isLoading) return;

    setIsLoading(true);
    setShowFileUpload(false);

    try {
      // If no active chat, create a message that will trigger a new chat
      await onSendMessage({ 
        content: message.trim() || `Please analyze this document: ${file.name}` 
      }, [file]);
      setMessage('');
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatMessage = (msg) => {
    return {
      id: msg.id,
      type: msg.type === 'user' ? 'user' : 'bot',
      content: msg.content,
      timestamp: msg.timestamp || msg.created_at,
      fileName: msg.file_name
    };
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <IndiflyLogo size="sm" />
              <span className="font-semibold text-lg" style={{ color: '#02295c' }}>
                Indifly AI
              </span>
            </div>
          </div>
        </div>

        {/* Welcome Screen */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-2xl">
            <div className="mb-8">
              <IndiflyLogo size="xl" className="mx-auto mb-6 drop-shadow-lg" />
              <h1 className="text-4xl font-bold mb-4" style={{ color: '#02295c' }}>
                Welcome to Indifly AI
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Your intelligent legal assistant powered by advanced AI
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="p-6 rounded-lg border-2 border-gray-100 hover:border-orange-200 transition-colors">
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#02295c' }}>
                    📄 Document Review
                  </h3>
                  <p className="text-gray-600">
                    Upload contracts, agreements, and legal documents for comprehensive analysis and recommendations.
                  </p>
                </div>
                <div className="p-6 rounded-lg border-2 border-gray-100 hover:border-orange-200 transition-colors">
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#02295c' }}>
                    ⚖️ Legal Guidance
                  </h3>
                  <p className="text-gray-600">
                    Get professional legal advice on compliance, regulations, and business law matters.
                  </p>
                </div>
                <div className="p-6 rounded-lg border-2 border-gray-100 hover:border-orange-200 transition-colors">
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#02295c' }}>
                    🏢 Business Formation
                  </h3>
                  <p className="text-gray-600">
                    Expert advice on company formation, corporate structure, and business registration.
                  </p>
                </div>
                <div className="p-6 rounded-lg border-2 border-gray-100 hover:border-orange-200 transition-colors">
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#02295c' }}>
                    📋 Compliance Review
                  </h3>
                  <p className="text-gray-600">
                    Ensure your business meets all regulatory requirements and industry standards.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-500 mb-4">Start a new conversation to begin</p>
              <div className="flex justify-center">
                <Button
                  onClick={onNewChat}
                  style={{ backgroundColor: '#fa6620', borderColor: '#fa6620' }}
                  className="min-w-[140px]"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const messages = activeChat.messages || [];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <IndiflyLogo size="sm" />
            <div>
              <h2 className="font-semibold text-lg" style={{ color: '#02295c' }}>
                {activeChat.title || 'Legal Consultation'}
              </h2>
              <p className="text-sm text-gray-500">
                AI-powered legal assistant
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Sparkles className="h-4 w-4" style={{ color: '#fa6620' }} />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && !isLoading ? (
            /* Welcome screen for empty chat */
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="mb-8">
                <IndiflyLogo size="lg" className="mx-auto mb-4 drop-shadow-md" />
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#02295c' }}>
                  Ready to assist you
                </h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  I'm your AI legal assistant. Ask me about contracts, compliance, business formation, or upload a document for analysis.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
                <div className="p-4 rounded-lg border border-gray-200 hover:border-orange-200 transition-colors">
                  <h3 className="font-semibold mb-2" style={{ color: '#02295c' }}>📄 Document Analysis</h3>
                  <p className="text-sm text-gray-600">Upload contracts, NDAs, or legal documents for detailed review</p>
                </div>
                <div className="p-4 rounded-lg border border-gray-200 hover:border-orange-200 transition-colors">
                  <h3 className="font-semibold mb-2" style={{ color: '#02295c' }}>⚖️ Legal Advice</h3>
                  <p className="text-sm text-gray-600">Get guidance on business law, compliance, and regulations</p>
                </div>
                <div className="p-4 rounded-lg border border-gray-200 hover:border-orange-200 transition-colors">
                  <h3 className="font-semibold mb-2" style={{ color: '#02295c' }}>🏢 Business Formation</h3>
                  <p className="text-sm text-gray-600">Help with company setup, structure, and incorporation</p>
                </div>
                <div className="p-4 rounded-lg border border-gray-200 hover:border-orange-200 transition-colors">
                  <h3 className="font-semibold mb-2" style={{ color: '#02295c' }}>📋 Contract Review</h3>
                  <p className="text-sm text-gray-600">Review terms, identify risks, and suggest improvements</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>💡 <strong>Tip:</strong> Be specific with your questions for better assistance</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={formatMessage(msg)}
                  isUser={msg.type === 'user'}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md">
                    <Loader />
                  </div>
                </div>
              )}
            </>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a legal question or describe your situation..."
                  disabled={isLoading}
                  className="pr-12 py-3 min-h-[48px] resize-none border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  style={{ borderColor: '#02295c' }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileUpload(true)}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="px-6 py-3 h-12"
              style={{ backgroundColor: '#02295c', borderColor: '#02295c' }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Indifly AI can make mistakes. Please verify important legal information.
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#02295c' }}>
              Upload Legal Document
            </h3>
            <FileUpload
              onFileUpload={handleFileUpload}
              onCancel={() => setShowFileUpload(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
