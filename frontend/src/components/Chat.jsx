import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Send, Menu, Paperclip, MoreVertical, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import Loader from './Loader';
import FileUpload from './FileUpload';
import { generateMockResponse, generateMessageId } from '../mock';

const Chat = ({ 
  activeChat, 
  onSendMessage, 
  onToggleSidebar, 
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

    const userMessage = {
      id: generateMessageId(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    onSendMessage(userMessage);
    setMessage('');
    setIsLoading(true);

    try {
      // Generate mock response
      const botResponse = await generateMockResponse(message.trim());
      
      const botMessage = {
        id: generateMessageId(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date().toISOString()
      };

      onSendMessage(botMessage);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file) => {
    const fileMessage = {
      id: generateMessageId(),
      type: 'user',
      content: `I've uploaded a document for your review: ${file.name}`,
      fileName: file.name,
      timestamp: new Date().toISOString()
    };

    onSendMessage(fileMessage);
    setShowFileUpload(false);
    
    // Auto-generate response for file upload
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const botResponse = await generateMockResponse(`Analyze this legal document: ${file.name}`);
        
        const botMessage = {
          id: generateMessageId(),
          type: 'bot',
          content: `I've analyzed your document "${file.name}". Here's my legal assessment:\n\n${botResponse}`,
          timestamp: new Date().toISOString()
        };

        onSendMessage(botMessage);
      } catch (error) {
        console.error('Error generating response:', error);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const suggestedPrompts = [
    "Review this employment contract for potential issues",
    "Help me understand GDPR compliance requirements",
    "Draft a privacy policy for my startup",
    "Explain the legal implications of this agreement"
  ];

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center max-w-md px-6">
          <div className="relative mb-8">
            {/* Indifly Ventures Logo */}
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl" style={{ backgroundColor: '#1b2f5a' }}>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                <div className="relative">
                  {/* "i" letter */}
                  <div className="w-4 h-4 rounded-full mb-2" style={{ backgroundColor: '#1b2f5a' }}></div>
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: '#1b2f5a' }}></div>
                  {/* Orange accent bars */}
                  <div className="absolute -right-2 top-0 w-5 h-2 rounded-sm" style={{ backgroundColor: '#ff6a22' }}></div>
                  <div className="absolute -right-2 top-4 w-5 h-2 rounded-sm" style={{ backgroundColor: '#ff6a22' }}></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-3 border-white flex items-center justify-center shadow-lg" style={{ backgroundColor: '#ff6a22' }}>
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#1b2f5a' }}>
            Indifly Ventures Legal Assistant
          </h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Get expert legal guidance powered by AI. Start a conversation to receive professional insights on contracts, compliance, and legal matters.
          </p>
          
          <div className="space-y-3">
            <p className="text-sm font-medium mb-4" style={{ color: '#1b2f5a' }}>Try asking about:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left justify-start h-auto p-3 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md transition-all duration-200 border-gray-200 text-sm"
                  style={{
                    borderColor: '#1b2f5a',
                    color: '#1b2f5a'
                  }}
                  onClick={() => setMessage(prompt)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#ff6a22';
                    e.target.style.color = 'white';
                    e.target.style.borderColor = '#ff6a22';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.color = '#1b2f5a';
                    e.target.style.borderColor = '#1b2f5a';
                  }}
                >
                  <span>{prompt}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {isMobile && !sidebarOpen && (
            <Button
              onClick={onToggleSidebar}
              className="mt-6 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              style={{ backgroundColor: '#1b2f5a' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#ff6a22'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1b2f5a'}
            >
              <Menu className="w-4 h-4 mr-2" />
              Open Chat History
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="border-b border-gray-200/50 p-4 shadow-sm" style={{ backgroundColor: '#1b2f5a' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && !sidebarOpen && (
              <Button
                onClick={onToggleSidebar}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="relative">
              {/* Indifly Ventures Logo */}
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <div className="relative">
                  {/* "i" letter */}
                  <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: '#1b2f5a' }}></div>
                  <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#1b2f5a' }}></div>
                  {/* Orange accent bars */}
                  <div className="absolute -right-1 top-0 w-3 h-1.5 rounded-sm" style={{ backgroundColor: '#ff6a22' }}></div>
                  <div className="absolute -right-1 top-2 w-3 h-1.5 rounded-sm" style={{ backgroundColor: '#ff6a22' }}></div>
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">
                {activeChat.title}
              </h1>
              <p className="text-white/70 text-sm">
                Legal Assistant • Online
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4 max-w-4xl mx-auto">
            {activeChat.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isUser={msg.type === 'user'}
              />
            ))}
            
            {isLoading && <Loader />}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {showFileUpload && (
            <div className="mb-4">
              <FileUpload onFileUpload={handleFileUpload} />
              <Button
                onClick={() => setShowFileUpload(false)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 mt-2"
              >
                Cancel
              </Button>
            </div>
          )}
          
          <div className="flex items-end space-x-3">
            <Button
              onClick={() => setShowFileUpload(!showFileUpload)}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 mb-2"
              style={{ '--hover-bg': '#ff6a22' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ff6a22';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6b7280';
              }}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            <form onSubmit={handleSubmit} className="flex-1 flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything about legal matters..."
                  className="pr-12 h-12 bg-white/90 backdrop-blur-sm transition-all duration-200"
                  style={{
                    borderColor: '#1b2f5a',
                    '--tw-ring-color': '#ff6a22'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff6a22'}
                  onBlur={(e) => e.target.style.borderColor = '#1b2f5a'}
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Button
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className="h-8 w-8 p-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.05]"
                    style={{ 
                      backgroundColor: '#1b2f5a',
                      borderColor: '#1b2f5a'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#ff6a22'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#1b2f5a'}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              <span className="font-medium" style={{ color: '#1b2f5a' }}>Legal Assistant</span> can provide guidance but responses should be verified with qualified legal professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;