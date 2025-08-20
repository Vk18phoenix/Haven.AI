import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import './MainLayout.css';
import { Menu, Plus, Cog, LogOut, Send, Mic, Share2, Pin, Trash2, Edit, PinOff, UserCircle } from 'lucide-react'; 
import toast, { Toaster } from 'react-hot-toast';
import SettingsModal from '../Settings/SettingsModal.jsx';
import AccountSettingsModal from '../Settings/AccountSettingsModal.jsx';
import FeedbackModal from '../Feedback/FeedbackModal.jsx';
import ProfileModal from '../Profile/ProfileModal.jsx';
import PaywallModal from '../Paywall/PaywallModal.jsx';
import { getAiResponse } from '../../ai/aiService.js';
import { getUserChatHistory, saveUserChatHistory, saveTempChat, reportMessage } from '../../firebase/firestoreService.js';
import aiLogo from '../../assets/ai-logo.png';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const BANNED_KEYWORDS = ['kill', 'suicide', 'bomb', 'terrorist', 'hate speech'];

const MainLayout = ({ user, openAuthModal }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null });
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [aiVoice, setAiVoice] = useState('female');
  const [voices, setVoices] = useState([]);
  const recognitionRef = useRef(null);
  const promptInputRef = useRef(null);
  const [guestLocked, setGuestLocked] = useState(false);

  useEffect(() => {
    const loadVoices = () => { setVoices(window.speechSynthesis.getVoices()); };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);
  
  useEffect(() => {
    if (!isTyping && promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, [isTyping, activeChatId]);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => { const history = await getUserChatHistory(user.uid); setChatHistory(history); };
      fetchHistory();
      setAvatarUrl(user.photoURL);
      if (messages.length > 0 && !activeChatId) {
        setMessages([]);
      }
    } else {
      setChatHistory([]);
      setMessages([]);
      setActiveChatId(null);
      setAvatarUrl(null);
      setGuestLocked(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user && messages.length >= 10 && !showPaywall) {
      setShowPaywall(true);
    }
  }, [messages, user, showPaywall]);
  
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
      toast.error("This message violates our safety policy and has been flagged.", { duration: 5000 });
      return;
    }

    const userMessage = { id: Date.now(), text: messageText, sender: 'user' };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setIsTyping(true);
    setPrompt('');
    
    let currentChatId = activeChatId;
    let updatedHistory = [...chatHistory];
    if (user) {
      if (currentChatId === null) {
        currentChatId = Date.now().toString();
        setActiveChatId(currentChatId);
        const newChat = { id: currentChatId, title: messageText.substring(0, 30) + '...', messages: currentMessages, pinned: false };
        updatedHistory = [newChat, ...chatHistory];
      } else {
        updatedHistory = chatHistory.map(chat =>
          chat.id === currentChatId ? { ...chat, messages: currentMessages } : chat
        );
      }
      setChatHistory(updatedHistory);
    }
    
    const aiResponseText = await getAiResponse(messageText, messages);
    const aiMessage = { id: Date.now() + 1, text: aiResponseText, sender: 'ai' };
    
    speakText(aiResponseText);
    
    const finalMessages = [...currentMessages, aiMessage];
    setMessages(finalMessages);
    
    if (user) {
      const finalHistory = updatedHistory.map(chat =>
        chat.id === currentChatId ? { ...chat, messages: finalMessages } : chat
      );
      setChatHistory(finalHistory);
      await saveUserChatHistory(user.uid, finalHistory);
    } else {
      await saveTempChat(finalMessages);
    }
    
    setIsTyping(false);
  };

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
    let selectedVoice = null;
    if (aiVoice === 'female') {
      selectedVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Female'));
    } else if (aiVoice === 'male') {
      selectedVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Male'));
    }
    utterance.voice = selectedVoice || voices.find(v => v.lang === 'en-US');
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, chatId: null });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleProfileUpdate = (newUrl) => { setAvatarUrl(newUrl); };
  const handleLogout = () => { signOut(getAuth()); };
  const handleNewChat = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setActiveChatId(null);
    setMessages([]);
  };
  const handleSelectChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setActiveChatId(chat.id);
      setMessages(chat.messages);
    }
  };
  const handleContextMenu = (e, chatId) => { e.preventDefault(); setContextMenu({ visible: true, x: e.pageX, y: e.pageY, chatId }); };
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
    if (window.confirm("Are you sure you want to delete your entire chat history? This cannot be undone.")) {
      await saveUserChatHistory(user.uid, []);
      setChatHistory([]);
      setActiveChatId(null);
      setMessages([]);
      toast.success('Chat history deleted.');
    }
  };

  const isInputDisabled = isTyping || (!user && guestLocked);

  return (
    <div className="layout-container">
      <div className="aurora-background">
        <div className="noise"></div>
        <div className="aurora__item"></div>
        <div className="aurora__item"></div>
        <div className="aurora__item"></div>
      </div>
      <Toaster position="top-center" />

      {contextMenu.visible && (() => {
          const chat = chatHistory.find(c => c.id === contextMenu.chatId);
          return ( <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}> <div onClick={() => handlePin(contextMenu.chatId)}> {chat?.pinned ? <PinOff size={16}/> : <Pin size={16}/>} {chat?.pinned ? 'Unpin' : 'Pin'} </div> <div onClick={() => setRenamingChatId(contextMenu.chatId)}><Edit size={16}/> Rename</div> <div onClick={() => handleShare(contextMenu.chatId)}><Share2 size={16}/> Share</div> <div className="delete" onClick={() => handleDelete(contextMenu.chatId)}><Trash2 size={16}/> Delete</div> </div> );
      })()}

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`} onMouseEnter={() => setSidebarOpen(true)} onMouseLeave={() => setSidebarOpen(false)}>
        <div className="sidebar-header"><Menu className="menu-icon" /><span className="sidebar-title">Haven.AI</span></div>
        <div className="new-chat-button" onClick={handleNewChat}><Plus size={20} /><span>New Chat</span></div>
        <div className="sidebar-content">
          {user ? (
            <>
              <p className="recent-title">History</p>
              {chatHistory.sort((a, b) => (b.pinned || 0) - (a.pinned || 0) || b.id - a.id).map(chat => (
                renamingChatId === chat.id ? ( <input key={chat.id} type="text" defaultValue={chat.title} className="rename-input" autoFocus onBlur={(e) => handleRename(chat.id, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRename(chat.id, e.target.value); }}/> ) : ( <div key={chat.id} className={`chat-history-item ${chat.id === activeChatId ? 'active' : ''}`} onClick={() => handleSelectChat(chat.id)} onContextMenu={(e) => handleContextMenu(e, chat.id)}> {chat.pinned && <Pin size={14} className="pin-icon" />} {chat.title} </div> )
              ))}
            </>
          ) : (
            <div className="guest-sidebar">
              {/* This is now correctly empty */}
            </div>
          )}
        </div>
        <div className="sidebar-footer">
           <div className="footer-item" onClick={() => user ? setShowSettingsModal(true) : openAuthModal()}><Cog size={20} /><span>Settings</span></div>
           {user && <div className="footer-item" onClick={handleLogout}><LogOut size={20} /><span>Logout</span></div>}
        </div>
      </div>

      <div className="main-content">
        <div className="main-header">
          <span>{user ? `Hello, ${user.displayName}` : 'Welcome, Guest'}</span>
          {user ? ( <img src={avatarUrl || '/default-avatar.png'} alt="User Avatar" className="user-avatar" onClick={() => setShowProfileModal(true)} /> ) : ( <button className="auth-button-header" onClick={openAuthModal}> <UserCircle size={20} /> <span>Login</span> </button> )}
        </div>
        <div className="chat-display-area">
          {messages.length === 0 ? <div className="center-message"><h1 className="greeting-text">Haven.AI</h1><p>I'm here to listen. What's on your mind?</p></div> : 
            messages.map(msg => (
              <div key={msg.id} className={`message-bubble ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>{msg.text}</div>
            ))
          }
          {isTyping && <div className="message-bubble ai-message typing-indicator"><span></span><span></span><span></span></div>}
           <div ref={chatEndRef} />
        </div>
        <div className="prompt-area">
          <form className="prompt-input-wrapper" onSubmit={handleSendMessage}>
            <input 
              ref={promptInputRef} 
              type="text" 
              placeholder={isInputDisabled ? "Please login to continue chatting" : "Message Haven.AI..."} 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              disabled={isInputDisabled}
            />
            <div className="prompt-buttons">
              <button type="button" className={`prompt-icon-button ${isListening ? 'listening' : ''}`} onClick={handleMicClick} disabled={isInputDisabled}><Mic size={20}/></button>
              <button type="submit" className="prompt-icon-button" disabled={isInputDisabled || prompt.trim() === ''}><Send size={20}/></button>
            </div>
          </form>
          <p className="prompt-footer">Haven.AI is an AI companion and not a medical professional.</p>
        </div>
      </div>
      
      {showPaywall && <PaywallModal onClose={() => {setShowPaywall(false); setGuestLocked(true);}} onAuth={() => {setShowPaywall(false); openAuthModal();}} />}
      {showProfileModal && <ProfileModal user={user} onUpdate={handleProfileUpdate} onClose={() => setShowProfileModal(false)} />}
      {showSettingsModal && <SettingsModal 
        onClose={() => setShowSettingsModal(false)} 
        onThemeChange={handleThemeChange}
        onVoiceChange={setAiVoice} currentVoice={aiVoice}
        onFeedbackClick={() => { setShowSettingsModal(false); setShowFeedbackModal(true); }}
        onAccountSettingsClick={() => { setShowSettingsModal(false); setShowAccountSettingsModal(true); }}
      />}
      {showAccountSettingsModal && <AccountSettingsModal user={user} onClose={() => setShowAccountSettingsModal(false)} onHistoryDelete={handleHistoryDelete} />}
      {showFeedbackModal && <FeedbackModal user={user} onClose={() => setShowFeedbackModal(false)} />}
    </div>
  );
};

export default MainLayout;