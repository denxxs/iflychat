import React from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Plus, MessageSquare, Menu, X, LogOut, Settings, User, Trash2 } from 'lucide-react';

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
        className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg border-0"
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
        } w-80 flex flex-col bg-white border-r border-gray-200/50 shadow-xl`}
        style={{ 
          transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
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
                <h2 className="text-gray-900 font-bold text-lg">Legal Assistant</h2>
                <p className="text-gray-500 text-xs font-medium">Indifly Ventures</p>
              </div>
            </div>
            
            {isMobile && (
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-900 text-sm font-semibold">{user.name}</p>
                <p className="text-gray-500 text-xs">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                onClick={onLogout}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2"
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
            className="w-full justify-start h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5 mr-3" />
            New Legal Consultation
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          <div className="px-4 py-2">
            <h3 className="text-gray-700 text-sm font-semibold mb-3">Recent Conversations</h3>
          </div>
          
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative rounded-lg transition-all duration-200 ${
                    activeChat?.id === chat.id 
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Button
                    onClick={() => onChatSelect(chat)}
                    variant="ghost"
                    className={`w-full justify-start text-left p-3 h-auto ${
                      activeChat?.id === chat.id ? 'text-blue-700' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        activeChat?.id === chat.id 
                          ? 'bg-blue-200 text-blue-700' 
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}>
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                          {formatChatTitle(chat)}
                        </p>
                        <p className={`text-xs mt-0.5 ${
                          activeChat?.id === chat.id ? 'text-blue-600' : 'text-gray-500'
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
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 transition-all duration-200"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Powered by <span className="font-semibold text-blue-600">Indifly Ventures</span>
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-600 to-orange-500 mx-auto mt-2"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;