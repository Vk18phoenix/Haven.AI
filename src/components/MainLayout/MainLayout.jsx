import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import './MainLayout.css';
// --- NEW, RELIABLE ICON IMPORTS ---
import { Menu, Plus, Cog, LogOut, Send } from 'lucide-react'; 
import ProfileModal from '../Profile/ProfileModal.jsx';
import { getAiResponse } from '../../ai/aiService.js';
import { getUserChatHistory, saveUserChatHistory } from '../../firebase/firestoreService.js';

const MainLayout = ({ user }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(user.photoURL);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        const history = await getUserChatHistory(user.uid);
        setChatHistory(history);
      };
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleProfileUpdate = (newUrl) => {
    setAvatarUrl(newUrl);
  };

  const handleLogout = () => { signOut(getAuth()); };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };
  
  const handleSelectChat = (chatId) => {
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat) {
      setActiveChatId(selectedChat.id);
      setMessages(selectedChat.messages);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (prompt.trim() === '' || isTyping) return;
    const userMessage = { id: Date.now(), text: prompt, sender: 'user' };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setIsTyping(true);
    setPrompt('');
    let currentChatId = activeChatId;
    let updatedHistory = [...chatHistory];
    if (currentChatId === null) {
      currentChatId = Date.now().toString();
      setActiveChatId(currentChatId);
      const newChat = {
        id: currentChatId,
        title: prompt.substring(0, 30) + (prompt.length > 30 ? '...' : ''),
        messages: currentMessages,
      };
      updatedHistory = [newChat, ...chatHistory];
    } else {
      updatedHistory = chatHistory.map(chat => 
        chat.id === currentChatId ? { ...chat, messages: currentMessages } : chat
      );
    }
    setChatHistory(updatedHistory);
    const aiResponseText = await getAiResponse(prompt, messages);
    const aiMessage = { id: Date.now() + 1, text: aiResponseText, sender: 'ai' };
    const finalMessages = [...currentMessages, aiMessage];
    setMessages(finalMessages);
    const finalHistory = updatedHistory.map(chat => 
      chat.id === currentChatId ? { ...chat, messages: finalMessages } : chat
    );
    setChatHistory(finalHistory);
    await saveUserChatHistory(user.uid, finalHistory);
    setIsTyping(false);
  };
  
  return (
    <div className="layout-container">
      <div 
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="sidebar-header">
          {/* --- NEW ICON COMPONENT --- */}
          <Menu className="menu-icon" />
          <span className="sidebar-title">Haven.AI</span>
        </div>
        <div className="new-chat-button" onClick={handleNewChat}>
          {/* --- NEW ICON COMPONENT --- */}
          <Plus size={20} />
          <span>New Chat</span>
        </div>
        <div className="sidebar-content">
          <p className="recent-title">Recent</p>
          {chatHistory.map(chat => (
            <div 
              key={chat.id} 
              className={`chat-history-item ${chat.id === activeChatId ? 'active' : ''}`}
              onClick={() => handleSelectChat(chat.id)}
            >
              {chat.title}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
           <div className="footer-item">
            {/* --- NEW ICON COMPONENT --- */}
            <Cog size={20} />
            <span>Settings</span>
          </div>
          <div className="footer-item" onClick={handleLogout}>
            {/* --- NEW ICON COMPONENT --- */}
            <LogOut size={20} />
            <span>Logout</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="main-header">
          <span>Hello, {user.displayName || user.email.split('@')[0]}</span>
          <img 
            src={avatarUrl || '/default-avatar.png'} 
            alt="User Avatar" 
            className="user-avatar"
            onClick={() => setShowProfileModal(true)}
          />
        </div>

        <div className="chat-display-area">
          {messages.length === 0 ? (
            <div className="center-message">
              <h1 className="greeting-text">Haven.AI</h1>
              <p>I'm here to listen. What's on your mind?</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`message-bubble ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                {msg.text}
              </div>
            ))
          )}
          {isTyping && (
            <div className="message-bubble ai-message typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
           <div ref={chatEndRef} />
        </div>

        <div className="prompt-area">
          <form className="prompt-input-wrapper" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              placeholder="Message Haven.AI..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="send-button" disabled={isTyping}>
                {/* --- NEW ICON COMPONENT --- */}
                <Send />
            </button>
          </form>
          <p className="prompt-footer">
            Haven.AI is an AI companion and not a medical professional.
          </p>
        </div>
      </div>
      
      {showProfileModal && (
        <ProfileModal user={user} onUpdate={handleProfileUpdate} onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
};

export default MainLayout;