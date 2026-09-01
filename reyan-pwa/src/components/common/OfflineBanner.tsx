import React from 'react';
import { useChat } from '../../context/ChatContext';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isNetworkOnline } = useChat();

  if (isNetworkOnline) return null;

  return (
    <div className="network-banner">
      <WifiOff size={16} />
      <span>Offline mode — Messages will be queued and synchronized automatically once connection is restored.</span>
    </div>
  );
};
