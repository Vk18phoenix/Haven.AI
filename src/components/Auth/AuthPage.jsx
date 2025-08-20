// src/components/Auth/AuthPage.jsx

import React from 'react';
import Login from './Login.jsx';
import Signup from './SignUp.jsx';
import './AuthPage.css';

// This component no longer needs 'onClose' because App.jsx handles the switch.
// We remove `theme` because the CSS handles it with :root.
const AuthPage = () => {
    return (
        <div className="auth-page-container">
            <div className="background-shapes">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
                <div className="shape shape3"></div>
            </div>
            
            {/* The main content wrapper, no longer a modal backdrop */}
            <div className="auth-content-wrapper">
                <div className="auth-header-main">
                    <svg width="225" height="60" viewBox="0 0 225 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-logo">
                        <path d="M12.9231 0C5.78318 0 0 5.78318 0 12.9231V47.0769C0 54.2168 5.78318 60 12.9231 60H212.077C219.217 60 225 54.2168 225 47.0769V12.9231C225 5.78318 219.217 0 212.077 0H12.9231Z" fill="#8AB4F8"/>
                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#111111" fontFamily="sans-serif" fontSize="24" fontWeight="bold">Haven.AI</text>
                    </svg>
                    <h1 className="auth-title-main">Haven.AI</h1>
                    <p className="auth-tagline-main">Your empathetic AI companion.</p>
                </div>

                <div className="auth-dual-wrapper">
                    <div className="auth-card">
                        <Login />
                    </div>
                    <div className="auth-divider"></div>
                    <div className="auth-card">
                        <Signup />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;