import React from 'react';
import { formatMediaUrl } from '../../services/api';
import { Chat } from '../../types';
import { useChat } from '../../context/ChatContext';
import { ArrowLeft, Phone, Video, Search, MoreVertical, VolumeX, Pin } from 'lucide-react';

interface ChatHeaderProps {
  chat: Chat;
  onBack: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ chat, onBack }) => {
  const { typingText } = useChat();

  const title = chat.type === 'GROUP' ? chat.name : chat.otherUser?.fullName || 'User';
  const avatar = chat.type === 'GROUP' ? chat.avatarUrl : chat.otherUser?.avatarUrl;
  const isOnline = chat.type === 'DIRECT' && Boolean(chat.otherUser?.isOnline || (chat.otherUser as any)?.online);

  const renderPresenceStatus = () => {
    if (typingText) {
      return <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>{typingText}</span>;
    }
    if (chat.type === 'GROUP') {
      return <span>{chat.members.length} members</span>;
    }
    if (isOnline) {
      return <span style={{ color: '#25d366', fontWeight: '500' }}>online</span>;
    }
    if (chat.otherUser?.lastSeen) {
      const date = new Date(chat.otherUser.lastSeen);
      return <span>last seen {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
    }
    return <span>offline</span>;
  };

  return (
    <div
      style={{
        height: '60px',
        padding: '0 16px',
        backgroundColor: 'var(--bg-header)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 5
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="btn-icon" onClick={onBack} title="Back">
          <ArrowLeft size={20} />
        </button>

        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-green)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              overflow: 'hidden'
            }}
          >
            {avatar ? (
              <img 
                src={formatMediaUrl(avatar)} 
                alt={title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(title || 'User')}&background=00a884&color=fff`;
                }}
              />
            ) : (
              title?.charAt(0).toUpperCase()
            )}
          </div>
          {isOnline && (
            <span
              style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                backgroundColor: '#25d366',
                border: '2px solid var(--bg-header)'
              }}
            />
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.2' }}>{title}</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{renderPresenceStatus()}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button className="btn-icon" title="Voice call (Coming soon)">
          <Phone size={18} />
        </button>
        <button className="btn-icon" title="Video call (Coming soon)">
          <Video size={18} />
        </button>
        <button className="btn-icon" title="Search in chat">
          <Search size={18} />
        </button>
        <button className="btn-icon" title="More options">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
};
