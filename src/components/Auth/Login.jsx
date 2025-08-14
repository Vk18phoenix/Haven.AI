import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import './Auth.css'; // Import the new CSS

const Login = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
       // No need to do anything else, the onAuthStateChanged in App.jsx will handle the redirect
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <form onSubmit={handleLogin}>
          <h2>Welcome Back</h2>
          <div className="input-group">
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" 
              required 
            />
          </div>
          <div className="input-group">
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              required 
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
          {error && <p className="auth-error">{error}</p>}
        </form>
        <p className="toggle-form-text">
          Don't have an account? <span onClick={toggleForm}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;