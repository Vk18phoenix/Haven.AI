// src/components/Auth/Signup.jsx

import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Mail, Lock, User } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    if (!displayName) {
        setError("Display name is required.");
        return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    
    setLoading(true);
    const auth = getAuth();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      // On success, onAuthStateChanged in App.jsx will handle navigation.
    } catch (error) {
      // Your error handling is good, we'll keep it.
      setError(error.message.replace('Firebase: ', '').replace(/\(auth.*\)\.?/, ''));
    } finally {
        // ========================================================================
        // THE SAME FIX IS APPLIED HERE
        // This guarantees the button is re-enabled after every signup attempt.
        setLoading(false);
        // ========================================================================
    }
  };

  return (
    <div className="auth-card-inner">
      <div className="auth-header">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-tagline">Start your journey with Haven.AI.</p>
      </div>
      <form onSubmit={handleSignUp} className="auth-form">
        <div className="input-group">
          <User className="input-icon" size={20} />
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display Name" required />
        </div>
        <div className="input-group">
          <Mail className="input-icon" size={20} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        </div>
        <div className="input-group">
          <Lock className="input-icon" size={20} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
};

export default Signup;