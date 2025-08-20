// src/components/Auth/Login.jsx

import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // This is your 'isSubmitting' state

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double clicks, just in case

    setError('');
    setLoading(true);
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On success, onAuthStateChanged in App.jsx will handle navigation.
    } catch (error) {
      // Your user-friendly error message is great. Let's make it even simpler.
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      // ========================================================================
      // THIS IS THE DEFINITIVE FIX
      // This line will now run GUARANTEED, whether the try block succeeds or fails.
      setLoading(false);
      // ========================================================================
    }
  };

  return (
    <div className="auth-card-inner">
      <div className="auth-header">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-tagline">Login to continue your journey.</p>
      </div>
      <form onSubmit={handleLogin} className="auth-form">
        <div className="input-group">
          <Mail className="input-icon" size={20} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        </div>
        <div className="input-group">
          <Lock className="input-icon" size={20} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;