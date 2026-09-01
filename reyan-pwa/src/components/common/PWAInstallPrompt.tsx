import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'var(--bg-card)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--accent-green)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        zIndex: 999
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Install Reyan App</span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Get the full desktop & mobile app experience</span>
      </div>

      <button className="btn-primary" onClick={handleInstallClick} style={{ padding: '6px 12px', fontSize: '12px' }}>
        <Download size={14} /> Install
      </button>

      <button className="btn-icon" onClick={() => setShowPrompt(false)}>
        <X size={16} />
      </button>
    </div>
  );
};
