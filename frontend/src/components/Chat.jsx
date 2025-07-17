import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Send, Menu } from 'lucide-react';
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isLoading]);

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
      content: `Uploaded file: ${file.name}`,
      fileName: file.name,
      timestamp: new Date().toISOString()
    };

    onSendMessage(fileMessage);
    
    // Auto-generate response for file upload
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const botResponse = await generateMockResponse(`Analyze this file: ${file.name}`);
        
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
    }, 500);
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#F9F9F9' }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">IV</span>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#333333' }}>
            Welcome to Indifly Ventures Legal Assistant
          </h2>
          <p className="text-lg mb-4" style={{ color: '#666666' }}>
            Start a new conversation to get legal assistance
          </p>
          {isMobile && !sidebarOpen && (
            <Button
              onClick={onToggleSidebar}
              className="mt-4"
              style={{ backgroundColor: '#6B5B95' }}
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
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#F9F9F9' }}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4" style={{ backgroundColor: '#1e3a8a' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && !sidebarOpen && (
              <Button
                onClick={onToggleSidebar}
                variant="ghost"
                className="text-white hover:bg-blue-700 md:hidden"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IV</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">
                {activeChat.title}
              </h1>
              <p className="text-blue-200 text-sm">
                Legal Assistant - Indifly Ventures
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
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
      <div className="border-t border-gray-200 p-4" style={{ backgroundColor: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <FileUpload onFileUpload={handleFileUpload} />
          
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a legal question..."
              className="flex-1 transition-all duration-200 focus:ring-2"
              style={{ 
                borderColor: '#6B5B95',
                '--tw-ring-color': '#F5A623'
              }}
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="transition-all duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: '#6B5B95',
                borderColor: '#6B5B95'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5A4A85'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6B5B95'}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          <p className="text-xs text-center mt-2" style={{ color: '#666666' }}>
            This is a demo. Legal advice should be verified with qualified professionals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;