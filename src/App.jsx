// src/App.jsx

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import MainLayout from './components/MainLayout/MainLayout';
import AuthPage from './components/Auth/AuthPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // If user logs in or out, automatically leave the authentication screen
      setAuthenticating(false);
    });
    return () => unsubscribe();
  }, []);

  const navigateToAuth = () => {
    setAuthenticating(true);
  };

  if (loading) {
    return <div className="loading-container"><h2>Loading...</h2></div>;
  }

  return (
    <div className="App">
      { isAuthenticating ? (
          <AuthPage />
      ) : (
          <MainLayout user={user} onNavigateToAuth={navigateToAuth} />
      )}
    </div>
  );
}

export default App;