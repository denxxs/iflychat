import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import apiService, { authHelpers } from './services/api';
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
  const [isLoading, setIsLoading] = useState(true);

  // Helper functions for localStorage
  const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const getFromLocalStorage = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  };

  // Load chats from API
  const loadChats = async () => {
    try {
      const response = await apiService.getChats();
      setChats(response.chats || []);
    } catch (error) {
      console.error('Error loading chats:', error);
      setChats([]);
    }
  };

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

  // Initialize app and check authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user has a valid session
        const authResult = await authHelpers.checkAuth();
        
        if (authResult.success) {
          setUser({ ...authResult.user, isLoggedIn: true });
          await loadChats();
        } else {
          // Clear any stale localStorage data
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem(STORAGE_KEYS.CHATS);
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
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

  const handleLogin = async (userData) => {
    setUser(userData);
    await loadChats();
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authHelpers.logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setChats([]);
      setActiveChat(null);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.CHATS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT);
    }
  };

  const handleNewChat = async (options = {}) => {
    try {
      const newChat = await apiService.createChat({
        title: 'New Legal Consultation'
      });
      
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);
      
      if (isMobile) {
        setIsSidebarOpen(false);
      }
      
      // If upload is requested, return a flag
      return { chat: newChat, shouldShowUpload: options.showFileUpload };
    } catch (error) {
      console.error('Error creating new chat:', error);
      return null;
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await apiService.deleteChat(chatId);
      
      // Remove chat from state
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was active, clear active chat
      if (activeChat && activeChat.id === chatId) {
        setActiveChat(null);
      }
      
      console.log('Chat deleted successfully');
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  const handleChatSelect = async (chat) => {
    try {
      // Load full chat data including messages
      const fullChat = await apiService.getChat(chat.id);
      const messages = await apiService.getChatMessages(chat.id);
      
      setActiveChat({
        ...fullChat,
        messages: messages || []
      });
      
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error selecting chat:', error);
      // Fallback to basic chat data
      setActiveChat(chat);
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    }
  };

  const handleSendMessage = async (message, files = []) => {
    let currentChat = activeChat;
    
    // Create a new chat if none exists
    if (!currentChat) {
      try {
        currentChat = await apiService.createChat({
          title: 'New Chat'
        });
        
        setChats(prev => [currentChat, ...prev]);
        setActiveChat(currentChat);
      } catch (error) {
        console.error('Error creating new chat:', error);
        return;
      }
    }

    // Create user message immediately and add to UI
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message.content,
      timestamp: new Date().toISOString(),
      file_name: files.length > 0 ? files[0].name : undefined
    };

    // Add user message to chat immediately
    const chatWithUserMessage = {
      ...currentChat,
      messages: [...(currentChat.messages || []), userMessage],
    };
    setActiveChat(chatWithUserMessage);

    try {
      // Upload files first if any
      const uploadedFiles = [];
      for (const file of files) {
        try {
          const uploadResult = await apiService.uploadFile(file);
          uploadedFiles.push(uploadResult);
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }

      // Send message with file references
      const messageData = {
        content: message.content,
        file_name: uploadedFiles.length > 0 ? uploadedFiles[0].original_name : null,
        file_url: uploadedFiles.length > 0 ? uploadedFiles[0].file_url : null,
        metadata: uploadedFiles.length > 0 ? { files: uploadedFiles } : {}
      };

      const response = await apiService.sendMessage(currentChat.id, messageData);
      
      // Update active chat with AI response (user message already added)
      if (response.ai_response) {
        const updatedChat = {
          ...chatWithUserMessage,
          messages: [
            ...chatWithUserMessage.messages,
            response.ai_response
          ],
          title: response.chat_name || currentChat.title,
          updated_at: new Date().toISOString()
        };
        
        setActiveChat(updatedChat);
        
        // Update chat in the list
        setChats(prev => prev.map(chat => 
          chat.id === currentChat.id 
            ? { ...chat, title: response.chat_name || chat.title, updated_at: new Date().toISOString() }
            : chat
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message if API fails (user message already added)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date().toISOString(),
      };

      const updatedChat = {
        ...chatWithUserMessage,
        messages: [...chatWithUserMessage.messages, errorMessage],
      };

      setActiveChat(updatedChat);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Show loading spinner while initializing
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading IFlyChat...</p>
        </div>
      </div>
    );
  }

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
        onDeleteChat={handleDeleteChat}
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
        onNewChat={handleNewChat}
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