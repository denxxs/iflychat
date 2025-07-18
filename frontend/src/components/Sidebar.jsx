import React from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Plus, MessageSquare, Menu, X, LogOut, User, Trash2 } from 'lucide-react';
import IndiflyLogo from './IndiflyLogo';

const Sidebar = ({ 
  chats, 
  activeChat, 
  onChatSelect, 
  onNewChat, 
  onDeleteChat,
  onLogout, 
  user, 
  isMobile = false,
  isOpen = true,
  onToggle 
}) => {
  const formatChatTitle = (chat) => {
    return chat.title.length > 30 ? chat.title.substring(0, 30) + '...' : chat.title;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isMobile && !isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 md:hidden text-white shadow-lg border-0"
        style={{ backgroundColor: '#02295c' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#fa6620'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#02295c'}
      >
        <Menu className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <div 
        className={`${
          isMobile 
            ? 'fixed left-0 top-0 h-full z-50 transform transition-transform duration-300'
            : 'relative'
        } w-80 flex flex-col shadow-xl`}
        style={{ 
          backgroundColor: '#02295c',
          transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IndiflyLogo size="md" className="drop-shadow-md" />
              <div>
                <h2 className="text-white font-bold text-lg">Indifly AI</h2>
                <p className="text-white/70 text-xs font-medium">Intelligent Legal Assistant</p>
              </div>
            </div>
            
            {isMobile && (
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 md:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{user.name}</p>
                <p className="text-white/70 text-xs">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                onClick={onLogout}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white p-2"
                style={{ '--hover-bg': '#fa6620' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fa6620'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={onNewChat}
            className="w-full justify-start h-11 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            style={{ 
              backgroundColor: '#fa6620',
              borderColor: '#fa6620'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e55a1a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#fa6620'}
          >
            <Plus className="w-5 h-5 mr-3" />
            New AI Consultation
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          <div className="px-4 py-2">
            <h3 className="text-white/90 text-sm font-semibold mb-3">Recent Conversations</h3>
          </div>
          
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1">
              {chats.map((chat) => {
                const isActive = activeChat?.id === chat.id;
                
                return (
                  <div
                    key={chat.id}
                    className="group relative transition-all duration-200"
                  >
                    <Button
                      onClick={() => onChatSelect(chat)}
                      variant="ghost"
                      className={`w-full justify-start text-left p-3 h-auto rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'text-white' 
                          : 'text-white/80 hover:text-white'
                      }`}
                      style={{
                        backgroundColor: isActive ? '#fa6620' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.target.style.backgroundColor = '#fa6620';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'
                        }`}>
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate text-sm transition-all duration-200 ${
                            isActive 
                              ? 'text-white' 
                              : 'text-white/80 group-hover:text-white'
                          }`}>
                            {formatChatTitle(chat)}
                          </p>
                          <p className={`text-xs mt-0.5 transition-all duration-200 ${
                            isActive 
                              ? 'text-white/80' 
                              : 'text-white/60 group-hover:text-white/80'
                          }`}>
                            {formatDate(chat.timestamp)}
                          </p>
                        </div>
                      </div>
                    </Button>
                    
                    {/* Delete button - shows on hover */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-white/60 hover:text-white p-1 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteChat && window.confirm('Are you sure you want to delete this chat?')) {
                          onDeleteChat(chat.id);
                        }
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fa6620'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-white/70 text-xs">
              Powered by <span className="font-semibold text-white">Indifly Ventures</span>
            </p>
            <div className="w-16 h-0.5 mx-auto mt-2" style={{ backgroundColor: '#fa6620' }}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;