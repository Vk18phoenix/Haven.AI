// src/components/MainLayout/MainLayout.jsx

import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import './MainLayout.css';
import { Menu, Plus, Cog, LogOut, Send, Mic, Share2, Pin, Trash2, Edit, PinOff, Shield, UserCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import SettingsModal from '../Settings/SettingsModal.jsx';
import AccountSettingsModal from '../Settings/AccountSettingsModal.jsx';
import FeedbackModal from '../Feedback/FeedbackModal.jsx';
import ProfileModal from '../Profile/ProfileModal.jsx';
import PaywallModal from '../Paywall/PaywallModal.jsx';
import { getAiResponse } from '../../ai/aiService.js';
import { getUserChatHistory, saveUserChatHistory, saveTempChat, reportMessage } from '../../firebase/firestoreService.js';
import aiLogo from '../../assets/ai-logo.png';
import appLogo from '../../assets/Haven_Logo.png';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const BANNED_KEYWORDS = ['kill', 'suicide', 'bomb', 'terrorist', 'hate speech'];

const MainLayout = ({ user, onNavigateToAuth }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [aiVoice, setAiVoice] = useState('female');
  const [voices, setVoices] = useState([]);
  const recognitionRef = useRef(null);
  const promptInputRef = useRef(null);
  const [guestLocked, setGuestLocked] = useState(false);
  const [isTempChat, setIsTempChat] = useState(!user);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    };
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    if (!isTyping && promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, [isTyping, activeChatId, isTempChat]);

  useEffect(() => {
    if (user) {
      setIsTempChat(false);
      const fetchHistory = async () => { const history = await getUserChatHistory(user.uid); setChatHistory(history); };
      fetchHistory();
      setAvatarUrl(user.photoURL);
      if (messages.length > 0 && !activeChatId && !isTempChat) {
        setMessages([]);
      }
    } else {
      setChatHistory([]);
      setMessages([]);
      setActiveChatId(null);
      setAvatarUrl(null);
      setIsTempChat(true);
      setGuestLocked(false);
    }
  }, [user]);

  useEffect(() => {
    const handleClick = () => {
      setContextMenu({ visible: false, x: 0, y: 0, chatId: null });
      setIsContextMenuOpen(false);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleSendMessage = async (e, textToSend = null) => {
    if (e) e.preventDefault();
    const messageText = textToSend || prompt;
    if (messageText.trim() === '' || isTyping) return;

    if (!user && messages.length >= 10) {
      setShowPaywall(true);
      return;
    }

    const lowerCaseMessage = messageText.toLowerCase();
    const hasBannedWord = BANNED_KEYWORDS.some(word => lowerCaseMessage.includes(word));
    if (user && hasBannedWord) {
      reportMessage(user.uid, messageText);
      toast.error("This message violates our safety policy.", { duration: 5000 });
      return;
    }

    const userMessage = { id: Date.now(), text: messageText, sender: 'user' };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setIsTyping(true);
    setPrompt('');

    let currentChatId = activeChatId;
    let updatedHistory = [...chatHistory];

    if (user && !isTempChat) {
      if (currentChatId === null) {
        currentChatId = Date.now().toString();
        setActiveChatId(currentChatId);
        const newChat = { id: currentChatId, title: messageText.substring(0, 30), messages: currentMessages, pinned: false };
        updatedHistory = [newChat, ...chatHistory];
      } else {
        updatedHistory = chatHistory.map(chat =>
          chat.id === currentChatId ? { ...chat, messages: currentMessages, title: chat.title } : chat
        );
      }
      setChatHistory(updatedHistory);
    }

    const aiResponseText = await getAiResponse(messageText, messages);
    const aiMessage = { id: Date.now() + 1, text: aiResponseText, sender: 'ai' };

    speakText(aiResponseText);

    const finalMessages = [...currentMessages, aiMessage];
    setMessages(finalMessages);

    if (user && !isTempChat) {
      const finalHistory = updatedHistory.map(chat =>
        chat.id === currentChatId ? { ...chat, messages: finalMessages } : chat
      );
      setChatHistory(finalHistory);
      await saveUserChatHistory(user.uid, finalHistory);
    } else if (!user) {
      await saveTempChat(finalMessages);
    }

    setIsTyping(false);
  };
  
  // ========================================================================
  //              --- THE `handleMicClick` FUNCTION IS RESTORED ---
  //          I apologize for carelessly deleting this entire function.
  // ========================================================================
  const handleMicClick = () => {
    if (!SpeechRecognition) return toast.error("Sorry, your browser doesn't support this feature.");
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    toast('Listening...', { icon: '🎤' });
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSendMessage(null, transcript);
    };
    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        const errorMessage = { id: Date.now(), text: "Sorry, I didn't catch that. How can I help?", sender: 'ai' };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        toast.error(`Mic error: ${event.error}`);
      }
    };
    recognition.onend = () => setIsListening(false);
  };
  
  const speakText = (text) => {
    if (!aiVoice || !text || window.speechSynthesis.speaking || voices.length === 0) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const englishVoices = voices.filter(v => v.lang.startsWith('en-'));
    if (englishVoices.length === 0) return;
    let selectedVoice = null;
    if (aiVoice === 'female') {
      selectedVoice = englishVoices.find(v => /female|femenina|femme|zira|samantha|susan/i.test(v.name));
      if (!selectedVoice) {
        selectedVoice = englishVoices.find(v => !/male|masculina|homme|david|mark/i.test(v.name));
      }
    } else {
      selectedVoice = englishVoices.find(v => /male|masculina|homme|david|mark/i.test(v.name));
    }
    utterance.voice = selectedVoice || englishVoices[0];
    window.speechSynthesis.speak(utterance);
  };

  const handleProfileUpdate = (newUrl) => { setAvatarUrl(newUrl); };
  const handleLogout = () => { signOut(getAuth()); };
  const handleNewChat = () => {
    if (!user) {
      setMessages([]);
      return;
    }
    setActiveChatId(null);
    setMessages([]);
    setIsTempChat(false);
  };

  const handleTempChat = () => {
    if (!user) { return; }
    setActiveChatId(null);
    setMessages([]);
    setIsTempChat(true);
  };
  const handleSelectChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setActiveChatId(chat.id);
      setMessages(chat.messages);
      setIsTempChat(false);
    }
  };
  const handleContextMenu = (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    setIsContextMenuOpen(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ visible: true, x: rect.right, y: rect.top, chatId: chatId });
  };
  const handleMenuAction = (action) => {
    action();
    setIsContextMenuOpen(false);
  };
  const handlePin = async (chatId) => {
    const chatToPin = chatHistory.find(chat => chat.id === chatId);
    const updatedHistory = chatHistory.map(chat => chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat);
    setChatHistory(updatedHistory);
    await saveUserChatHistory(user.uid, updatedHistory);
    toast.success(chatToPin.pinned ? 'Chat unpinned!' : 'Chat pinned!');
  };
  const handleRename = async (chatId, newTitle) => {
    if (!newTitle.trim()) { setRenamingChatId(null); return; }
    const updatedHistory = chatHistory.map(chat => chat.id === chatId ? { ...chat, title: newTitle } : chat);
    setChatHistory(updatedHistory);
    setRenamingChatId(null);
    await saveUserChatHistory(user.uid, updatedHistory);
    toast.success('Chat renamed!');
  };
  const handleDelete = async (chatId) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
    await saveUserChatHistory(user.uid, updatedHistory);
    toast.success('Chat deleted!');
  };
  const handleShare = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    const shareText = `Check out my conversation with Haven.AI: "${chat.title}"`;
    if (navigator.share) {
      navigator.share({ title: 'Haven.AI Chat', text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${shareText} - ${window.location.href}`);
      toast.success('Link copied to clipboard!');
    }
  };
  const handleThemeChange = (theme) => {
    document.documentElement.className = theme;
  };
  const handleHistoryDelete = async () => {
    if (window.confirm("Are you sure you want to delete your entire chat history?")) {
      await saveUserChatHistory(user.uid, []);
      setChatHistory([]);
      setActiveChatId(null);
      setMessages([]);
      toast.success('Chat history deleted.');
    }
  };
  
  const isInputDisabled = isTyping || (!user && guestLocked);
  const placeholderText = guestLocked
    ? "Please login to continue chatting"
    : "Message Haven.AI...";
  
  return (
    <div className="layout-container">
      <div className="aurora-background"></div>
      <Toaster position="top-center" />
      {contextMenu.visible && (() => {
        const chat = chatHistory.find(c => c.id === contextMenu.chatId);
        return (
          <div className="context-menu" style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}>
            <div className="context-menu-item" onClick={() => handleMenuAction(() => handleShare(contextMenu.chatId))}><Share2 size={16} /> Share</div>
            <div className="context-menu-item" onClick={() => handleMenuAction(() => handlePin(contextMenu.chatId))}> {chat?.pinned ? <PinOff size={16} /> : <Pin size={16} />} {chat?.pinned ? 'Unpin' : 'Pin'} </div>
            <div className="context-menu-item" onClick={() => handleMenuAction(() => { setRenamingChatId(contextMenu.chatId); setSidebarOpen(true); })}><Edit size={16} /> Rename</div>
            <div className="context-menu-item delete" onClick={() => handleMenuAction(() => handleDelete(contextMenu.chatId))}><Trash2 size={16} /> Delete</div>
          </div>
        )
      })()}
      <div
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => !isContextMenuOpen && setSidebarOpen(false)}
      >
        <div className="sidebar-header">
          <Menu className="menu-icon" />
          <img src={appLogo} alt="Haven.AI Logo" className="sidebar-logo show-on-open" />
        </div>

        <div className="sidebar-buttons">
          <div className="new-chat-button" onClick={handleNewChat}> <Plus size={20} /> <span className="show-on-open">New Chat</span> </div>
          {user && (
            <div className="temp-chat-button" onClick={handleTempChat}> <Shield size={20} /> <span className="show-on-open">Temporary Chat</span> </div>
          )}
        </div>

        <div className="sidebar-content">
          {user && (
            <>
              <p className="recent-title show-on-open">Recent</p>
              {chatHistory.sort((a, b) => (b.pinned || 0) - (a.pinned || 0) || b.id - a.id).map(chat => (
                renamingChatId === chat.id ? (
                  <input key={chat.id} type="text" defaultValue={chat.title} className="rename-input" autoFocus onBlur={(e) => handleRename(chat.id, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRename(chat.id, e.target.value); }} />
                ) : (
                  <div key={chat.id} className={`chat-history-item ${!isTempChat && chat.id === activeChatId ? 'active' : ''}`} onClick={() => handleSelectChat(chat.id)} onContextMenu={(e) => handleContextMenu(e, chat.id)}>
                    {chat.pinned && <Pin size={14} className="pin-icon" />}
                    <span className="chat-title-text show-on-open">{chat.title}</span>
                  </div>
                )
              ))}
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className={`footer-item ${!user ? 'disabled' : ''}`} onClick={() => user ? setShowSettingsModal(true) : null}>
            <Cog size={20} />
            <span className="show-on-open">Settings</span>
          </div>
          {user && <div className="footer-item" onClick={handleLogout}><LogOut size={20} /><span className="show-on-open">Logout</span></div>}
        </div>
      </div>
      <div className="main-content">
        <div className="main-header">
          <div className="header-brand">
            <span>Haven.AI</span>
          </div>

          {user ? (
            <img
              src={avatarUrl || '/default-avatar.png'}
              alt="User Avatar"
              className="user-avatar"
              onClick={() => setShowProfileModal(true)}
            />
          ) : (
            <button className="auth-button-header" onClick={onNavigateToAuth}>
              <UserCircle size={20} />
              <span>Login</span>
            </button>
          )}
        </div>

        <div className="chat-display-area">
          {messages.length === 0 ? (
            <div className="center-message">
              <h1 className="greeting-text">{user ? `Hello, ${user.displayName} 👋` : 'Welcome to Haven.AI'}</h1>
              <p className="greeting-subtitle">{user ? greeting : "I'm here to listen. What's on your mind?"}</p>
            </div>
          ) : (
            messages.map(msg => (
              msg.sender === 'user' ? (
                <div key={msg.id} className="message-bubble user-message">{msg.text}</div>
              ) : (
                <div key={msg.id} className="ai-message-container">
                  <img src={aiLogo} alt="AI logo" className="ai-inline-logo" />
                  <div className="message-bubble ai-message">{msg.text}</div>
                </div>
              )
            ))
          )}
          {isTyping && <div className="ai-message-container"> <img src={aiLogo} alt="AI logo" className="ai-inline-logo" /> <div className="message-bubble ai-message typing-indicator"> <span></span><span></span><span></span> </div> </div>}
        </div>

        <div className="prompt-area">
          <form className="prompt-input-wrapper" onSubmit={handleSendMessage}>
            <input
              ref={promptInputRef}
              type="text"
              placeholder={placeholderText}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isInputDisabled}
            />
            <div className="prompt-buttons">
              <button type="button" className={`prompt-icon-button ${isListening ? 'listening' : ''}`} onClick={handleMicClick} disabled={isInputDisabled}><Mic size={20} /></button>
              <button type="submit" className="prompt-icon-button" disabled={isInputDisabled || prompt.trim() === ''}><Send size={20} /></button>
            </div>
          </form>
          <p className="prompt-footer">Haven.AI may produce inaccurate information.</p>
        </div>
      </div>

      {showPaywall && <PaywallModal
        onClose={() => { setShowPaywall(false); setGuestLocked(true); }}
        onAuth={() => {
          setShowPaywall(false);
          onNavigateToAuth();
        }}
      />}

      {user && showProfileModal && <ProfileModal user={user} onUpdate={handleProfileUpdate} onClose={() => setShowProfileModal(false)} />}
      {user && showSettingsModal && <SettingsModal
        onClose={() => setShowSettingsModal(false)}
        onThemeChange={handleThemeChange}
        onVoiceChange={setAiVoice} currentVoice={aiVoice}
        onFeedbackClick={() => { setShowSettingsModal(false); setShowFeedbackModal(true); }}
        onAccountSettingsClick={() => { setShowSettingsModal(false); setShowAccountSettingsModal(true); }}
      />}
      {user && showAccountSettingsModal && <AccountSettingsModal user={user} onClose={() => setShowAccountSettingsModal(false)} onHistoryDelete={handleHistoryDelete} />}
      {user && showFeedbackModal && <FeedbackModal user={user} onClose={() => setShowFeedbackModal(false)} />}
    </div>
  );
};

export default MainLayout;