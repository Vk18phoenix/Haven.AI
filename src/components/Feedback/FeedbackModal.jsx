import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import './FeedbackModal.css';
import { Paperclip } from 'lucide-react';

const FeedbackModal = ({ user, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File is too large. Please select a file under 10MB.');
      return;
    }
    setFile(selectedFile);
  };

  const sendFeedback = async (e) => {
    e.preventDefault();
    if (feedback.trim() === '' || isSending) return;

    setIsSending(true);
    const toastId = toast.loading('Sending feedback...');

    let imageUrl = "No image attached.";

    // --- NEW: UPLOAD IMAGE TO FIREBASE STORAGE ---
    if (file) {
      toast.loading('Compressing & uploading image...', { id: toastId });
      
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      try {
        const compressedFile = await imageCompression(file, options);
        const storage = getStorage();
        // Create a unique file path for the feedback attachment
        const filePath = `feedback-attachments/${user.uid}/${Date.now()}-${compressedFile.name}`;
        const storageRef = ref(storage, filePath);
        
        const snapshot = await uploadBytes(storageRef, compressedFile);
        imageUrl = await getDownloadURL(snapshot.ref);
        
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.error('Could not upload image. Sending feedback without it.', { id: toastId });
      }
    }
    
    // --- SEND EMAIL WITH IMAGE URL ---
    toast.loading('Sending feedback...', { id: toastId });
    const templateParams = {
      feedback_message: feedback,
      user_info: `User ID: ${user.uid}, Email: ${user.email}`,
      image_url: imageUrl, // Add the image URL to the template
    };

    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    ).then((response) => {
        toast.success('Feedback sent successfully!', { id: toastId });
        setIsSending(false);
        onClose();
      }, (err) => {
        console.error('EMAILJS FAILED...', err);
        toast.error(`Failed: ${err.text || 'Check EmailJS dashboard'}`, { id: toastId, duration: 8000 });
        setIsSending(false);
      });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content feedback-modal" onClick={e => e.stopPropagation()}>
        <div className="feedback-header">
          <h3>Send feedback to Haven.AI</h3>
          <button className="close-icon" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={sendFeedback}>
          <label className="feedback-label">Describe your feedback (required)</label>
          <textarea
            placeholder="Tell us what prompted this feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          <p className="info-text">Please don’t include any sensitive information.</p>
          
          <p className="screenshot-text">An attachment will help us better understand your feedback.</p>
          {/* This is the new, working file attachment button */}
          <label className="attach-button">
            <Paperclip size={16} /> Attach a file (max 10MB)
            <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
          </label>
          {file && <p className="file-name">Selected: {file.name}</p>}

          <div className="checkbox-container">
            <input type="checkbox" id="email-updates" defaultChecked />
            <label htmlFor="email-updates">We may email you for more information or updates</label>
          </div>

          <p className="legal-text">
            Some <a>account and system information</a> may be sent. We will use it to fix problems and improve our services.
          </p>
          
          <div className="feedback-footer">
            <button type="submit" className="send-button-feedback" disabled={feedback.trim() === '' || isSending}>
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;