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
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center max-w-md px-6">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">i</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
              <Sparkles className="w-3 h-3 text-yellow-700" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Indifly Ventures Legal Assistant
          </h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Get expert legal guidance powered by AI. Start a conversation to receive professional insights on contracts, compliance, and legal matters.
          </p>
          
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 mb-4">Try asking about:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left justify-start h-auto p-3 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md transition-all duration-200 border-gray-200 text-sm"
                  onClick={() => setMessage(prompt)}
                >
                  <span className="text-gray-700">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {isMobile && !sidebarOpen && (
            <Button
              onClick={onToggleSidebar}
              className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && !sidebarOpen && (
              <Button
                onClick={onToggleSidebar}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">i</span>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white font-bold text-xs">V</span>
              </div>
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-lg">
                {activeChat.title}
              </h1>
              <p className="text-gray-500 text-sm">
                Legal Assistant • Online
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
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
                  className="pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white/90 backdrop-blur-sm transition-all duration-200"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Button
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className="h-8 w-8 p-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.05]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Legal Assistant</span> can provide guidance but responses should be verified with qualified legal professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;