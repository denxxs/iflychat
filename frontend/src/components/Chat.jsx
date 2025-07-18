import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Menu, Paperclip, MoreVertical, Sparkles, Download, Trash2, ChevronDown } from 'lucide-react';
import MessageBubble from './MessageBubble';
import StreamingMessageBubble from './StreamingMessageBubble';
import Loader from './Loader';
import FileUpload from './FileUpload';
import IndiflyLogo from './IndiflyLogo';
import { exportChatToPdf } from '../utils/pdfExport';

const Chat = ({ 
  activeChat, 
  onSendMessage, 
  onToggleSidebar, 
  onNewChat,
  onDeleteChat,
  isMobile = false,
  sidebarOpen = true 
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const scrollAreaRef = useRef(null);

  const scrollToBottom = () => {
    if (!scrollAreaRef.current) return;
    
    // Fast scroll animation like a rapid scroll down
    const targetScrollTop = scrollAreaRef.current.scrollHeight - scrollAreaRef.current.clientHeight;
    const startScrollTop = scrollAreaRef.current.scrollTop;
    const distance = targetScrollTop - startScrollTop;
    const duration = 300; // Fast animation
    const startTime = performance.now();
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for rapid deceleration effect
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      scrollAreaRef.current.scrollTop = startScrollTop + (distance * easeOut);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
    setShowScrollToBottom(false);
  };

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const hasMessages = activeChat?.messages?.length > 0;
    
    // Calculate if we're at the bottom with a small tolerance
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isAtBottom = distanceFromBottom <= 5; // Very small tolerance
    
    // Show button whenever bottom is not visible and there are messages
    setShowScrollToBottom(!isAtBottom && hasMessages);
  };

  useEffect(() => {
    if (!scrollAreaRef.current) return;
    
    // Direct scroll handling for raw, immediate response like Gmail
    scrollAreaRef.current.addEventListener('scroll', handleScroll);
    
    // Check initial scroll position
    handleScroll();
    
    // Also check periodically to ensure button state is correct
    const intervalId = setInterval(() => {
      if (scrollAreaRef.current) {
        handleScroll();
      }
    }, 500); // Check every 500ms
    
    return () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.removeEventListener('scroll', handleScroll);
      }
      clearInterval(intervalId);
    };
  }, [activeChat?.messages?.length]);

  useEffect(() => {
    // Check scroll position when chat changes and scroll to bottom initially
    setTimeout(() => {
      if (scrollAreaRef.current) {
        // Scroll to bottom when chat first loads
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        handleScroll();
      }
    }, 100); // Small delay to ensure DOM is updated
  }, [activeChat?.id]);

  useEffect(() => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const wasAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    // Only auto-scroll to bottom if user was already at the bottom
    if (wasAtBottom) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      // After auto-scroll, ensure button is hidden
      setTimeout(() => handleScroll(), 50);
    } else {
      // If user was scrolled up, check if button should be shown
      setTimeout(() => handleScroll(), 50);
    }
  }, [activeChat?.messages, isLoading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChat]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExportToPdf = async () => {
    if (!activeChat || !activeChat.messages) return;
    
    try {
      await exportChatToPdf(activeChat, activeChat.messages);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleDeleteChat = async () => {
    if (!activeChat) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete "${activeChat.title}"? This action cannot be undone.`);
    if (confirmed && onDeleteChat) {
      try {
        await onDeleteChat(activeChat.id);
        setShowDropdown(false);
      } catch (error) {
        console.error('Error deleting chat:', error);
        alert('Failed to delete chat. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const messageText = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      await onSendMessage({ content: messageText }, [], useStreaming);
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
      }, [file], useStreaming);
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
    <div className="flex-1 flex flex-col h-full relative">
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
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={useStreaming}
                        onChange={(e) => setUseStreaming(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Stream responses</span>
                    </label>
                  </div>
                  <button
                    onClick={handleExportToPdf}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export to PDF</span>
                  </button>
                  <button
                    onClick={handleDeleteChat}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Chat</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 p-4 overflow-y-auto chat-scroll" 
        ref={scrollAreaRef}
      >
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
              {messages.map((msg) => {
                if (msg.isStreaming && msg.type === 'bot') {
                  return (
                    <StreamingMessageBubble
                      key={msg.id}
                      content={msg.content}
                      isComplete={false}
                    />
                  );
                } else {
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={formatMessage(msg)}
                      isUser={msg.type === 'user'}
                    />
                  );
                }
              })}
              
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
      </div>

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

      {/* Fixed Scroll to Bottom Button - positioned relative to main container */}
      {showScrollToBottom && (
        <div className="absolute bottom-20 right-6 z-50">
          <Button
            onClick={scrollToBottom}
            size="sm"
            className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 hover:bg-gray-50 hover:scale-105"
            style={{ 
              backgroundColor: '#ffffff',
              borderColor: '#e5e7eb',
              animation: 'fadeIn 0.3s ease-in-out'
            }}
            title="Scroll to bottom"
          >
            <ChevronDown className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Chat;
