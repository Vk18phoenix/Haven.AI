// src/components/Auth/AuthPage.jsx

import React from 'react';
import Login from './Login.jsx';
import Signup from './SignUp.jsx';
import './AuthPage.css';
import Logo from "../../assets/favicon.png"; 

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
                     <img src={Logo} alt="Haven.AI Logo" className="auth-logo" />
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