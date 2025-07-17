import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import { mockChats, mockUser, saveToLocalStorage, getFromLocalStorage, generateChatId } from './mock';
import './App.css';

const STORAGE_KEYS = {
  USER: 'indifly_user',
  CHATS: 'indifly_chats',
  ACTIVE_CHAT: 'indifly_active_chat'
};

const ChatApp = () => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = getFromLocalStorage(STORAGE_KEYS.USER);
    const savedChats = getFromLocalStorage(STORAGE_KEYS.CHATS);
    const savedActiveChat = getFromLocalStorage(STORAGE_KEYS.ACTIVE_CHAT);

    if (savedUser && savedUser.isLoggedIn) {
      setUser(savedUser);
      setChats(savedChats || mockChats);
      
      if (savedActiveChat) {
        const foundChat = (savedChats || mockChats).find(chat => chat.id === savedActiveChat);
        if (foundChat) {
          setActiveChat(foundChat);
        }
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      saveToLocalStorage(STORAGE_KEYS.USER, user);
    }
  }, [user]);

  useEffect(() => {
    if (chats.length > 0) {
      saveToLocalStorage(STORAGE_KEYS.CHATS, chats);
    }
  }, [chats]);

  useEffect(() => {
    if (activeChat) {
      saveToLocalStorage(STORAGE_KEYS.ACTIVE_CHAT, activeChat.id);
    }
  }, [activeChat]);

  const handleLogin = (userData) => {
    setUser(userData);
    setChats(mockChats);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setChats([]);
    setActiveChat(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT);
  };

  const handleNewChat = () => {
    const newChat = {
      id: generateChatId(),
      title: 'New Legal Consultation',
      timestamp: new Date().toISOString(),
      messages: []
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleSendMessage = (message) => {
    if (!activeChat) return;

    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, message],
      timestamp: new Date().toISOString()
    };

    // Update the title for the first message
    if (activeChat.messages.length === 0 && message.type === 'user') {
      updatedChat.title = message.content.length > 40 
        ? message.content.substring(0, 40) + '...' 
        : message.content;
    }

    setActiveChat(updatedChat);
    
    // Update chats array
    setChats(prev => prev.map(chat => 
      chat.id === activeChat.id ? updatedChat : chat
    ));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!user || !user.isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex antialiased">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
        user={user}
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />
      
      <Chat
        activeChat={activeChat}
        onSendMessage={handleSendMessage}
        onToggleSidebar={toggleSidebar}
        isMobile={isMobile}
        sidebarOpen={isSidebarOpen}
      />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;