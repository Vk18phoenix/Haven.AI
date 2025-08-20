import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

const SettingsModal = ({ onClose, onThemeChange, onVoiceChange, currentVoice, onFeedbackClick, onAccountSettingsClick }) => {
  const [location, setLocation] = useState('Fetching...');

  const fetchLocation = async () => {
    setLocation('Updating...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          setLocation(data.city || 'Not found');
        } catch (error) { setLocation('Error'); }
      }, () => { setLocation('Permission denied'); });
    } else { setLocation('Not supported'); }
  };

  // --- THIS IS THE FIX: This hook calls the function when the component loads ---
  useEffect(() => {
    fetchLocation();
  }, []); // The empty array means this runs only once.

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
        <h2>Settings</h2>
        
        <div className="setting-item">
          <label>Account</label>
          <div className="setting-control">
            <button className="manage-account-btn" onClick={onAccountSettingsClick}>Manage Account</button>
          </div>
        </div>

        <div className="setting-item">
          <label>Theme</label>
          <div className="setting-control">
            <button onClick={() => onThemeChange('light')}>Light</button>
            <button onClick={() => onThemeChange('dark')}>Dark</button>
          </div>
        </div>

        <div className="setting-item">
          <label>Voice Assistant</label>
          <div className="setting-control">
            <button className={currentVoice === 'female' ? 'active' : ''} onClick={() => onVoiceChange('female')}>Female</button>
            <button className={currentVoice === 'male' ? 'active' : ''} onClick={() => onVoiceChange('male')}>Male</button>
            <button className={currentVoice === null ? 'active' : ''} onClick={() => onVoiceChange(null)}>Off</button>
          </div>
        </div>

        <div className="setting-item">
          <label>Location Info</label>
          <div className="setting-control">
            <span className="location-text">{location}</span>
            <button className="update-location-btn" onClick={fetchLocation}>Update location</button>
          </div>
        </div>
        
        <div className="setting-item">
          <label>Send Feedback</label>
          <div className="setting-control">
             <button className="feedback-link" onClick={onFeedbackClick}>Send Feedback</button>
          </div>
        </div>

        <button className="close-button" onClick={onClose}>Done</button>
      </div>
    </div>
  );
};

export default SettingsModal;