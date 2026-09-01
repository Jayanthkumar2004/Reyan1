import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserSettings, ThemeSetting } from '../../types';
import { X, Moon, Bell, Lock, LogOut } from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getSettings().then(setSettings).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await api.updateSettings({ [key]: value });
    } catch (e) {
      console.error('Failed to update settings', e);
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
        <h3 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)' }}>Settings</h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Appearance */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-green)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Moon size={16} /> Appearance
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(['LIGHT', 'DARK', 'SYSTEM'] as ThemeSetting[]).map((mode) => (
              <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <input
                  type="radio"
                  name="theme"
                  checked={theme === mode}
                  onChange={() => setTheme(mode)}
                />
                {mode === 'LIGHT' ? 'Light Theme' : mode === 'DARK' ? 'Dark Theme' : 'System Default'}
              </label>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-green)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={16} /> Notifications
          </h4>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <span>Message Notifications</span>
            <input
              type="checkbox"
              checked={settings?.notificationEnabled ?? true}
              onChange={(e) => updateSetting('notificationEnabled', e.target.checked)}
            />
          </label>
        </div>

        {/* Privacy */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-green)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={16} /> Privacy
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <span>Read Receipts</span>
              <input
                type="checkbox"
                checked={settings?.readReceipts ?? true}
                onChange={(e) => updateSetting('readReceipts', e.target.checked)}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <span>Typing Indicator</span>
              <input
                type="checkbox"
                checked={settings?.typingIndicator ?? true}
                onChange={(e) => updateSetting('typingIndicator', e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Account & Sign Out */}
        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            className="btn-primary"
            onClick={logout}
            style={{
              width: '100%',
              backgroundColor: 'rgba(234, 67, 53, 0.1)',
              color: 'var(--accent-danger)',
              border: '1px solid var(--accent-danger)'
            }}
          >
            <LogOut size={18} /> Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
};
