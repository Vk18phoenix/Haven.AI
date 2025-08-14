import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import MainLayout from "./components/MainLayout/MainLayout.jsx";
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // Set loading to false once user state is determined
    });
    return () => unsubscribe();
  }, []);

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  // Show a loading spinner or blank page while checking auth state
  if (loading) {
    return <div></div>; 
  }

  return (
    <div className="App">
      {user ? (
        <MainLayout user={user} />
      ) : (
        showLogin ? <Login toggleForm={toggleForm} /> : <SignUp toggleForm={toggleForm} />
      )}
    </div>
  );
}

export default App;
