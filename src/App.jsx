import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import MainLayout from './components/MainLayout/MainLayout.jsx';
import AuthModal from './components/Auth/AuthPage.jsx'; // We are using the MODAL
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.className = prefersDark ? 'dark' : 'light';
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setShowAuthModal(false); // Close modal on successful login
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ backgroundColor: '#121212', height: '100vh', width: '100vw' }}></div>;
  }

  return (
    <div className="App">
      <MainLayout 
        user={user} // Pass the user (null if guest)
        openAuthModal={() => setShowAuthModal(true)} // Pass the function to open the modal
      />
      
      {/* The AuthModal is only shown when the showAuthModal state is true */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

export default App;