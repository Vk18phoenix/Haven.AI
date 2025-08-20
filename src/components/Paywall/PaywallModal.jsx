import React from 'react';
import './PaywallModal.css';
import { Heart, Lock } from 'lucide-react';

// Added onRequestClose prop to handle backdrop clicks
const PaywallModal = ({ onAuth, onClose, onRequestClose }) => {
  return (
    // Moved the backdrop click handler here for a better pattern
    <div className="modal-backdrop paywall-backdrop" onClick={onRequestClose}>
      {/* Removed the onClick from here to prevent event propagation issues */}
      <div className="modal-content paywall-modal" onClick={e => e.stopPropagation()}>
        <Heart className="paywall-icon" size={48} />
        <h2>Enjoying the conversation?</h2>
        <p>Create a free account to save this chat, view your history, and continue talking with Haven.AI.</p>
        <div className="paywall-buttons">
          <button className="paywall-auth-btn" onClick={onAuth}>Sign Up or Login</button>
          <button className="paywall-close-btn" onClick={onClose}>Maybe Later</button>
        </div>
        <p className="paywall-footer"><Lock size={12} /> Your conversations are private and secure.</p>
      </div>
    </div>
  );
};

export default PaywallModal;