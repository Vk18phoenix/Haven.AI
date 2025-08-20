import React, { useState } from 'react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import toast from 'react-hot-toast';
import './AccountSettingsModal.css';

const AccountSettingsModal = ({ user, onClose, onHistoryDelete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
    setLoading(true);
    const auth = getAuth();
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    try {
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      toast.success('Password updated successfully!');
      setCurrentPassword(''); setNewPassword('');
    } catch (error) { toast.error('Failed to update. Check your current password.'); }
    setLoading(false);
  };
  
  const handleDeleteAccount = async () => {
    const pass = prompt("DANGER: This is irreversible. Please enter your password to confirm account deletion.");
    if (pass) {
      setLoading(true);
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(user.email, pass);
      try {
        await reauthenticateWithCredential(auth.currentUser, credential);
        await deleteUser(auth.currentUser);
        toast.success('Account deleted. You are being logged out.');
      } catch (error) { toast.error('Failed to delete account. Check your password.'); }
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content account-settings-modal" onClick={e => e.stopPropagation()}>
        <h2>Account Management</h2>
        <div className="account-section">
          <h4>Profile Information</h4>
          <p><strong>Name:</strong> {user.displayName}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <div className="account-section">
          <h4>Change Password</h4>
          <form onSubmit={handlePasswordUpdate}>
            <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            <button type="submit" className="action-button" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
          </form>
        </div>
        <div className="account-section danger-zone">
          <h4>Danger Zone</h4>
          <button className="danger-button" onClick={onHistoryDelete}>Delete All Chat History</button>
          <button className="danger-button" onClick={() => toast('This feature is coming soon!', { icon: '🚧' })}>Deactivate Account</button>
          <button className="danger-button" onClick={handleDeleteAccount} disabled={loading}>Permanently Delete Account</button>
        </div>
        <button className="close-button" onClick={onClose}>Done</button>
      </div>
    </div>
  );
};

export default AccountSettingsModal;