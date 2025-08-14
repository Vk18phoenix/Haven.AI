import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import './Auth.css'; // Import the new CSS

const SignUp = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!displayName) {
        setError("Display name is required.");
        return;
    }
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      // No need to do anything else, the onAuthStateChanged in App.jsx will handle the redirect
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <form onSubmit={handleSignUp}>
          <h2>Create Your Account</h2>
          <div className="input-group">
            <input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder="Display Name" 
              required 
            />
          </div>
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
          <button type="submit" className="auth-button">Sign Up</button>
          {error && <p className="auth-error">{error}</p>}
        </form>
        <p className="toggle-form-text">
          Already have an account? <span onClick={toggleForm}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;