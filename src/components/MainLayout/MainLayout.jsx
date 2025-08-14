import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import './MainLayout.css';
import { HiMenu, HiOutlinePlus, HiOutlineCog, HiOutlineLogout } from 'react-icons/hi';
import { IoSend } from "react-icons/io5";
import ProfileModal from '../Profile/ProfileModal.jsx';
import { getAiResponse } from '../../ai/aiService.js';
import { getUserChatHistory, saveUserChatHistory } from '../../firebase/firestoreService.js'; // Import Firestore functions

const MainLayout = ({ user }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // -- STATE MANAGEMENT --
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]); // Current conversation's messages
  const [chatHistory, setChatHistory] = useState([]); // List of all conversations for the sidebar
  const [activeChatId, setActiveChatId] = useState(null); // ID of the currently active chat
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // -- EFFECTS --
  // Fetch chat history when the component loads
  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        const history = await getUserChatHistory(user.uid);
        setChatHistory(history);
      };
      fetchHistory();
    }
  }, [user]);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);


  // -- HANDLER FUNCTIONS --
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

    // --- HISTORY SAVING LOGIC ---
    let currentChatId = activeChatId;
    let updatedHistory = [...chatHistory];

    if (currentChatId === null) {
      // This is a new chat, create it.
      currentChatId = Date.now().toString();
      setActiveChatId(currentChatId);
      const newChat = {
        id: currentChatId,
        title: prompt.substring(0, 30) + (prompt.length > 30 ? '...' : ''),
        messages: currentMessages,
      };
      updatedHistory = [newChat, ...chatHistory];
    } else {
      // This is an existing chat, update it.
      updatedHistory = chatHistory.map(chat => 
        chat.id === currentChatId ? { ...chat, messages: currentMessages } : chat
      );
    }
    setChatHistory(updatedHistory);
    
    // --- AI RESPONSE ---
    const aiResponseText = await getAiResponse(prompt, messages);
    const aiMessage = { id: Date.now() + 1, text: aiResponseText, sender: 'ai' };
    
    const finalMessages = [...currentMessages, aiMessage];
    setMessages(finalMessages);
    
    // --- FINAL SAVE TO FIRESTORE ---
    const finalHistory = updatedHistory.map(chat => 
      chat.id === currentChatId ? { ...chat, messages: finalMessages } : chat
    );
    setChatHistory(finalHistory);
    await saveUserChatHistory(user.uid, finalHistory);

    setIsTyping(false);
  };
  
  // -- RENDER --
  return (
    <div className="layout-container">
      <div 
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="sidebar-header">
          <HiMenu className="menu-icon" />
          <span className="sidebar-title">Haven Buddy</span>
        </div>
        <div className="new-chat-button" onClick={handleNewChat}>
          <HiOutlinePlus size={20} />
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
          <div className="footer-item" onClick={handleLogout}>
            <HiOutlineLogout size={20} />
            <span>Logout</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Header and other components remain the same */}
        <div className="main-header">
          <span>Hello, {user.displayName || user.email.split('@')[0]}</span>
          <img 
            src={user.photoURL || '/default-avatar.png'} 
            alt="User Avatar" 
            className="user-avatar"
            onClick={() => setShowProfileModal(true)}
          />
        </div>

        <div className="chat-display-area">
          {messages.length === 0 ? (
            <div className="center-message">
              <h1 className="greeting-text">Haven Buddy</h1>
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
              placeholder="Message Haven Buddy..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="send-button" disabled={isTyping}><IoSend /></button>
          </form>
          <p className="prompt-footer">
            Haven Buddy is an AI companion and not a medical professional.
          </p>
        </div>
      </div>
      
      {showProfileModal && (
        <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
};

export default MainLayout;