import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, updateProfile } from 'firebase/auth';
import imageCompression from 'browser-image-compression'; // Import the library
import './ProfileModal.css';

const EMOJIS = ['😊', '😎', '🚀', '🎉', '💻', '💡', '❤️', '🧠'];

const ProfileModal = ({ user, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('Upload a new image or choose an emoji.');

  // --- NEW UNIFIED UPLOAD FUNCTION FOR DP UPLOADING ---
  const uploadProfilePicture = async (fileToUpload) => {
    if (!fileToUpload) return;
    setLoading(true);
    setFeedback('Uploading picture...');

    const auth = getAuth();
    const storage = getStorage();
    // Use a consistent name for the avatar for easier management
    const filePath = `avatars/${user.uid}/profile.png`;
    const fileRef = ref(storage, filePath);

    try {
      const snapshot = await uploadBytes(fileRef, fileToUpload);
      const photoURL = await getDownloadURL(snapshot.ref);
      await updateProfile(auth.currentUser, { photoURL });
      
      setFeedback('Profile updated successfully!');
      setTimeout(() => {
        onClose(); // Close modal on success
        window.location.reload(); // Refresh to see new picture
      }, 1000);

    } catch (error) {
      console.error("Error uploading file:", error);
      setFeedback('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // --- UPDATED to handle compression ---
  const handleFileChangeAndCompress = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFeedback('Compressing image...');
    const options = {
      maxSizeMB: 0.5, // Compress to a max of 0.5MB
      maxWidthOrHeight: 800, // Resize to a max width/height of 800px
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setFeedback('Image ready to upload!');
      // Call the unified upload function directly
      await uploadProfilePicture(compressedFile);
    } catch (error) {
      console.error("Image compression error:", error);
      setFeedback('Could not process this image. Please try another.');
    }
  };

  // --- UPDATED to generate an image from the emoji FOR DP ---
  const handleEmojiSelect = async (emoji) => {
    setFeedback('Generating emoji picture...');
    setLoading(true);

    const canvas = document.createElement('canvas');
    const size = 256; // 256x256 pixels
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Create a circular background
    ctx.fillStyle = '#3a3d40'; // A nice dark grey
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw the emoji in the center
    ctx.fillStyle = 'white';
    ctx.font = `${size * 0.6}px sans-serif`; // Large font for the emoji
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size / 2, size / 2);

    // Convert canvas to a file-like Blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        // Call the unified upload function with the generated image
        await uploadProfilePicture(blob);
      }
    }, 'image/png');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Update Profile Picture</h2>
        <p className="feedback-text">{feedback}</p>
        
        <div className="upload-section">
          <label className="upload-button-label">
            Choose an Image
            <input 
              type="file" 
              onChange={handleFileChangeAndCompress} 
              accept="image/*" 
              disabled={loading}
              style={{ display: 'none' }} // Hide the default input
            />
          </label>
        </div>

        <div className="emoji-section">
            <p>Or select an emoji:</p>
            <div className="emoji-grid">
                {EMOJIS.map(emoji => (
                    <div 
                      key={emoji} 
                      className={`emoji-item ${loading ? 'disabled' : ''}`} 
                      onClick={() => !loading && handleEmojiSelect(emoji)}
                    >
                        {emoji}
                    </div>
                ))}
            </div>
        </div>
        <button className="close-button" onClick={onClose} disabled={loading}>
          {loading ? 'Please wait...' : 'Cancel'}
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
