import React, { useState } from 'react';
import { formatMediaUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { X, Camera, Check, LogOut } from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [about, setAbout] = useState(user?.about || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ fullName, about, phone });
      onClose();
    } catch (e: any) {
      alert(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadMedia(file, 'avatars');
      await updateProfile({ avatarUrl: res.mediaUrl });
    } catch (e: any) {
      alert(e.message || 'Avatar upload failed');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'var(--bg-sidebar)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border-color)'
      }}
    >
      <div
        style={{
          height: '60px',
          padding: '0 16px',
          backgroundColor: 'var(--bg-header)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <button className="btn-icon" onClick={onClose}>
          <X size={20} />
        </button>
        <h3 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)' }}>Profile</h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {/* Avatar Editor */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-green)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '42px',
                fontWeight: '600',
                overflow: 'hidden'
              }}
            >
              {user?.avatarUrl ? (
                <img src={formatMediaUrl(user.avatarUrl)} alt={user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.fullName.charAt(0).toUpperCase()
              )}
            </div>
            <label
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-green)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <Camera size={18} />
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--accent-green)', marginBottom: '4px' }}>
              Your Name
            </label>
            <input
              type="text"
              className="input-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--accent-green)', marginBottom: '4px' }}>
              About
            </label>
            <input
              type="text"
              className="input-field"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--accent-green)', marginBottom: '4px' }}>
              Phone Number
            </label>
            <input
              type="text"
              className="input-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: '12px' }}>
            <Check size={18} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>

          <button
            className="btn-primary"
            onClick={logout}
            style={{
              marginTop: '12px',
              backgroundColor: 'rgba(234, 67, 53, 0.1)',
              color: 'var(--accent-danger)',
              border: '1px solid var(--accent-danger)'
            }}
          >
            <LogOut size={18} /> Sign Out of Reyan
          </button>
        </div>
      </div>
    </div>
  );
};
