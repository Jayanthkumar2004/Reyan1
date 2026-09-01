import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Sidebar } from '../components/sidebar/Sidebar';
import { ChatView } from '../components/chat/ChatView';
import { ProfileDrawer } from '../components/modals/ProfileDrawer';
import { SettingsDrawer } from '../components/modals/SettingsDrawer';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { PWAInstallPrompt } from '../components/common/PWAInstallPrompt';

export const AppLayout: React.FC = () => {
  const { activeChat, selectChat } = useChat();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <OfflineBanner />

      <div className="app-container" style={{ flex: 1 }}>
        <Sidebar
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isMobileChatActive={!!activeChat}
        />

        <ChatView
          onBackMobile={() => selectChat(null)}
          isMobileChatActive={!!activeChat}
        />
      </div>

      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <PWAInstallPrompt />
    </div>
  );
};
