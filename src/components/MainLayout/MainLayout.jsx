// components/MainLayout/MainLayout.jsx

import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import './MainLayout.css';
import { Menu, Plus, Cog, LogOut, Send, Mic, Share2, Pin, Trash2, Edit, PinOff, UserCircle, MessageSquare } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import SettingsModal from '../Settings/SettingsModal.jsx';
import AccountSettingsModal from '../Settings/AccountSettingsModal.jsx';
import FeedbackModal from '../Feedback/FeedbackModal.jsx';
import ProfileModal from '../Profile/ProfileModal';
import PaywallModal from '../Paywall/PaywallModal.jsx';
import { getAiResponse } from '../../ai/aiService.js';
import { getUserChatHistory, saveUserChatHistory, saveTempChat, reportMessage } from '../../firebase/firestoreService.js';
import aiLogo from '../../assets/ai-logo.png';
import favicon from '/src/assets/favicon.png';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const BANNED_KEYWORDS = ['kill', 'suicide', 'bomb', 'terrorist', 'hate speech'];

<<<<<<< HEAD
const MainLayout = ({ user, openAuthModal, theme, onThemeChange }) => {
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
    const [renamingChatId, setRenamingChatId] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [aiVoice, setAiVoice] = useState('female');
    const [voices, setVoices] = useState([]);
    const recognitionRef = useRef(null);
    const promptInputRef = useRef(null);

    const [guestLocked, setGuestLocked] = useState(false);
    const [showGuestMessage, setShowGuestMessage] = useState(false);

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
            setShowGuestMessage(false);
        }
    }, [user]);

    useEffect(() => {
        document.body.className = theme === 'dark' ? '' : 'light-theme';
    }, [theme]);

    const handleSendMessage = async (e, textToSend = null) => {
        if (e) e.preventDefault();
        const messageText = textToSend || prompt;
        const isInputDisabled = isTyping || (!user && guestLocked);
        if (messageText.trim() === '' || isInputDisabled) return;

        if (!user && messages.length >= 10) {
            setShowPaywall(true);
            return;
        }

        const userMessage = { id: Date.now(), text: messageText, sender: 'user' };
        const currentMessages = [...messages, userMessage];
        setPrompt('');
        setIsTyping(true);

        const lowerCaseMessage = messageText.toLowerCase();
        const hasBannedWord = BANNED_KEYWORDS.some(word => lowerCaseMessage.includes(word));
        if (user && hasBannedWord) {
            reportMessage(user.uid, messageText);
            toast.error("This message violates our safety policy and has been flagged.", { duration: 5000 });
            setIsTyping(false);
            return;
        }

        const aiResponseText = await getAiResponse(messageText, messages);
        const aiMessage = { id: Date.now() + 1, text: aiResponseText, sender: 'ai' };

        speakText(aiResponseText);

        const finalMessages = [...currentMessages, aiMessage];
        setMessages(finalMessages);

        if (activeChatId === 'temp-chat') {
            await saveTempChat(finalMessages);
        } else if (user) {
            let updatedHistory = [...chatHistory];
            let currentChatId = activeChatId;

            if (currentChatId === null) {
                currentChatId = Date.now().toString();
                setActiveChatId(currentChatId);
                const newChat = { id: currentChatId, title: messageText.substring(0, 30) + '...', messages: finalMessages, pinned: false };
                updatedHistory = [newChat, ...chatHistory];
            } else {
                updatedHistory = chatHistory.map(chat =>
                    chat.id === currentChatId ? { ...chat, messages: finalMessages } : chat
                );
            }
            setChatHistory(updatedHistory);
            await saveUserChatHistory(user.uid, updatedHistory);
        } else {
            await saveTempChat(finalMessages);
        }

        setIsTyping(false);
=======
const MainLayout = ({ user }) => {
  // All are same only 
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(user.photoURL);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null });
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [aiVoice, setAiVoice] = useState('female');
  
  // --- NEW: THIS STATE HELPS TO HOLD THE LOADED VOICES ---
  const [voices, setVoices] = useState([]);
  const recognitionRef = useRef(null);

  // --- NEW, WITH THE CORRECTED EFFECT TO LOAD VOICES RELIABLY, WITHOUT ERRORS---
  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
>>>>>>> f9ac9db1c2bf80042bf1ddbdee7a1280a814b80a
    };

    const handleMicClick = () => {
        if (!SpeechRecognition) return toast.error("Sorry, your browser doesn't support this feature.");
        const isInputDisabled = isTyping || (!user && guestLocked);
        if (isInputDisabled) return;
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
            if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'));
        } else if (aiVoice === 'male') {
            selectedVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Male'));
            if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Male'));
        }
        utterance.voice = selectedVoice || voices.find(v => v.lang === 'en-US');
        window.speechSynthesis.speak(utterance);
    };
<<<<<<< HEAD

    const handleProfileUpdate = (newUrl) => { setAvatarUrl(newUrl); };
=======
    recognition.onend = () => setIsListening(false);
  };
  
  // --- NEW, CORRECTED TEXT-TO-SPEECH FUNCTION SO THE SPPEAKING WILL BE CONVERTED TO TEXT TO THE AI ---
  const speakText = (text) => {
    if (!aiVoice || !text || window.speechSynthesis.speaking || voices.length === 0) return;
    const utterance = new SpeechSynthesisUtterance(text);
    let selectedVoice = null;

    if (aiVoice === 'female') {
      //We can find the best available female voice
      selectedVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Female'));
      if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'));
    } else if (aiVoice === 'male') {
      // We can find the best available male voice
      selectedVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Male'));
      if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Male'));
    }
    
    // Use the found voice, if not fallback to the first available US English voice
    utterance.voice = selectedVoice || voices.find(v => v.lang === 'en-US');
    window.speechSynthesis.speak(utterance);
  };
>>>>>>> f9ac9db1c2bf80042bf1ddbdee7a1280a814b80a

    const handleLogout = () => {
        signOut(getAuth());
        setGuestLocked(false);
        setShowGuestMessage(false);
    };

    const handleNewChat = () => {
        setActiveChatId(null);
        setMessages([]);
    };

    const handleNewTempChat = () => {
        if (!user) {
            toast.error("You must be logged in to start a temporary chat.");
            return;
        }
        setActiveChatId('temp-chat');
        setMessages([]);
    };

    const handleSelectChat = (chatId) => {
        const chat = chatHistory.find(c => c.id === chatId);
        if (chat) {
            setActiveChatId(chat.id);
            setMessages(chat.messages);
        }
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
        if (activeChatId === chatId) handleNewChat();
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

    const handleThemeChange = (selectedTheme) => {
        onThemeChange(selectedTheme);
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
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

            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`} onMouseEnter={() => setSidebarOpen(true)} onMouseLeave={() => setSidebarOpen(false)}>
                <div className="sidebar-header">
                    <Menu className="menu-icon" />
                    <span className="sidebar-title show-on-open">Haven.AI</span>
                </div>
                <div className="sidebar-buttons">
                    <div className="new-chat-button" onClick={handleNewChat}>
                        <Plus size={20} />
                        <span className="show-on-open">New Chat</span>
                    </div>
                    {user && (
                        <div className="new-chat-button" onClick={handleNewTempChat}>
                            <MessageSquare size={20} />
                            <span className="show-on-open">Temporary Chat</span>
                        </div>
                    )}
                </div>
                <div className="sidebar-content">
                    {user ? (
                        <>
                            <p className="recent-title show-on-open">History</p>
                            {chatHistory.sort((a, b) => (b.pinned || 0) - (a.pinned || 0) || b.id - a.id).map(chat => (
                                renamingChatId === chat.id ? (
                                    <input key={chat.id} type="text" defaultValue={chat.title} className="rename-input" autoFocus onBlur={(e) => handleRename(chat.id, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRename(chat.id, e.target.value); }} />
                                ) : (
                                    <div key={chat.id} className={`chat-history-item ${chat.id === activeChatId ? 'active' : ''}`} onClick={() => handleSelectChat(chat.id)}>
                                        <div className="chat-title-wrapper">
                                            {chat.pinned && <Pin size={14} className="pin-icon" />}
                                            <span className="chat-title">{chat.title}</span>
                                        </div>
                                        <div className="chat-options-icons">
                                            <PinOff size={16} onClick={(e) => { e.stopPropagation(); handlePin(chat.id); }} />
                                            <Edit size={16} onClick={(e) => { e.stopPropagation(); setRenamingChatId(chat.id); }} />
                                            <Share2 size={16} onClick={(e) => { e.stopPropagation(); handleShare(chat.id); }} />
                                            <Trash2 size={16} onClick={(e) => { e.stopPropagation(); handleDelete(chat.id); }} />
                                        </div>
                                    </div>
                                )
                            ))}
                        </>
                    ) : (
                        <div className="guest-sidebar">
                        </div>
                    )}
                </div>
                <div className="sidebar-footer">
                    <div className="footer-item" onClick={() => user ? setShowSettingsModal(true) : openAuthModal()}>
                        <Cog size={20} />
                        <span className="show-on-open">Settings</span>
                    </div>
                    {user && (
                        <div className="footer-item" onClick={handleLogout}>
                            <LogOut size={20} />
                            <span className="show-on-open">Logout</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="main-content">
                <div className="main-header">
                    {user ? (
                        <>
                            {/* New Haven.AI logo and clickable text */}
                            <div className="header-left" onClick={handleNewChat}>
                                <img src={favicon} alt="Haven.AI Logo" className="header-logo" />
                                <span className="logo-text">Haven.AI</span>
                            </div>
                            {/* Updated Greeting (was part of header-left) */}
                            <img src={avatarUrl || '/default-avatar.png'} alt="User Avatar" className="user-avatar" onClick={() => setShowProfileModal(true)} />
                        </>
                    ) : (
                        <>
                            <span className="user-greeting">Welcome, Guest</span>
                            <button className="auth-button-header" onClick={openAuthModal}>
                                <UserCircle size={20} />
                                <span>Login</span>
                            </button>
                        </>
                    )}
                </div>
                <div className="chat-display-area">
                    {messages.length === 0 ? (
                        <div className="center-message">
                            <h2 className="greeting-message-heading">
                                Hello, {getGreeting()}, {user?.displayName.split(' ')[0]}!
                            </h2>
                            <p>I'm here to listen. What's on your mind?</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className={`message-bubble ${msg.sender === 'user' ? 'user-message' : 'ai-message-container'}`}>
                                {msg.sender === 'ai' && <img src={aiLogo} alt="AI logo" className="ai-inline-logo" />}
                                <div className="message-text">{msg.text}</div>
                            </div>
                        ))
                    )}
                    {isTyping && <div className="message-bubble ai-message typing-indicator"><span></span><span></span><span></span></div>}
                    <div ref={chatEndRef} />
                </div>
                <div className="prompt-area">
                    {showGuestMessage && (
                        <div className="guest-limit-message">
                            It looks like you've reached your conversation limit for now. To continue chatting and get unlimited access, please sign in or create an account.
                        </div>
                    )}
                    <form className="prompt-input-wrapper" onSubmit={handleSendMessage}>
                        <input
                            ref={promptInputRef}
                            type="text"
                            placeholder={"Message Haven.AI..."}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isInputDisabled}
                        />
                        <div className="prompt-buttons">
                            <button type="button" className={`prompt-icon-button ${isListening ? 'listening' : ''}`} onClick={handleMicClick} disabled={isInputDisabled}><Mic size={20} /></button>
                            <button type="submit" className="prompt-icon-button" disabled={isInputDisabled || prompt.trim() === ''}><Send size={20} /></button>
                        </div>
                    </form>
                    <p className="prompt-footer">Haven.AI is an AI companion and not a medical professional.</p>
                </div>
            </div>

            {showPaywall && <PaywallModal
                onClose={() => {
                    setShowPaywall(false);
                    setGuestLocked(true);
                    setShowGuestMessage(true);
                }}
                onAuth={() => {
                    setShowPaywall(false);
                    openAuthModal();
                }}
                onRequestClose={() => {
                    setShowPaywall(false);
                    setGuestLocked(true);
                    setShowGuestMessage(true);
                }}
            />}

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
