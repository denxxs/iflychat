import React, { useState } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Plus, MessageSquare, Menu, X, LogOut } from 'lucide-react';

const Sidebar = ({ 
  chats, 
  activeChat, 
  onChatSelect, 
  onNewChat, 
  onLogout, 
  user, 
  isMobile = false,
  isOpen = true,
  onToggle 
}) => {
  const formatChatTitle = (chat) => {
    return chat.title.length > 25 ? chat.title.substring(0, 25) + '...' : chat.title;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  if (isMobile && !isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 md:hidden"
        style={{ backgroundColor: '#6B5B95' }}
      >
        <Menu className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <div 
        className={`${
          isMobile 
            ? 'fixed left-0 top-0 h-full z-50 transform transition-transform duration-300'
            : 'relative'
        } w-80 flex flex-col`}
        style={{ 
          backgroundColor: '#1e3a8a',
          transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none'
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IV</span>
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Legal Assistant</h2>
                <p className="text-blue-200 text-xs">Indifly Ventures</p>
              </div>
            </div>
            
            {isMobile && (
              <Button
                onClick={onToggle}
                variant="ghost"
                className="text-white hover:bg-blue-700 md:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-blue-200 text-xs">{user.email}</p>
              </div>
            </div>
            
            <Button
              onClick={onLogout}
              variant="ghost"
              className="text-white hover:bg-blue-700 transition-colors duration-200"
              style={{ '--hover-bg': '#F5A623' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#F5A623'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={onNewChat}
            className="w-full justify-start transition-all duration-200 hover:shadow-lg"
            style={{ 
              backgroundColor: '#F5A623',
              borderColor: '#F5A623'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#E8951F'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#F5A623'}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          <div className="px-4 py-2">
            <h3 className="text-white text-sm font-medium mb-2">Recent Chats</h3>
          </div>
          
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1">
              {chats.map((chat) => (
                <Button
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  variant="ghost"
                  className={`w-full justify-start text-left p-3 transition-all duration-200 hover:shadow-md ${
                    activeChat?.id === chat.id ? 'bg-blue-700' : 'hover:bg-blue-700'
                  }`}
                  style={{
                    backgroundColor: activeChat?.id === chat.id ? '#F5A623' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (activeChat?.id !== chat.id) {
                      e.target.style.backgroundColor = '#F5A623';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeChat?.id !== chat.id) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <MessageSquare className="w-4 h-4 text-white flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {formatChatTitle(chat)}
                      </p>
                      <p className="text-blue-200 text-xs">
                        {formatDate(chat.timestamp)}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-700">
          <p className="text-blue-200 text-xs text-center">
            Powered by Indifly Ventures
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;