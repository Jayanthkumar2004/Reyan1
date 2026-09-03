import React from 'react';
import { formatMediaUrl } from '../../services/api';
import { Chat } from '../../types';
import { Pin, VolumeX, Check, CheckCheck } from 'lucide-react';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({ chat, isActive, onClick }) => {
  const title = chat.type === 'GROUP' ? chat.name : chat.otherUser?.fullName || 'User';
  const avatar = chat.type === 'GROUP' ? chat.avatarUrl : chat.otherUser?.avatarUrl;
  const isOnline = chat.type === 'DIRECT' && Boolean(chat.otherUser?.isOnline || (chat.otherUser as any)?.online);

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderStatusTicks = (status?: string) => {
    if (status === 'READ') return <CheckCheck size={14} className="status-tick read" />;
    if (status === 'DELIVERED') return <CheckCheck size={14} className="status-tick" />;
    return <Check size={14} className="status-tick" />;
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        cursor: 'pointer',
        backgroundColor: isActive ? 'var(--active-bg)' : 'transparent',
        borderBottom: '1px solid var(--border-color)',
        transition: 'background-color var(--transition-fast)'
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Avatar Container */}
      <div style={{ position: 'relative', marginRight: '14px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-green)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '18px',
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
              bottom: '2px',
              right: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#25d366',
              border: '2px solid var(--bg-sidebar)'
            }}
          />
        )}
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h4
            style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {title}
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {formatTime(chat.lastMessage?.createdAt || chat.updatedAt)}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {chat.lastMessage && renderStatusTicks(chat.lastMessage.status)}
            <span>
              {chat.lastMessage ? (
                chat.lastMessage.deleted ? (
                  <em style={{ color: 'var(--text-muted)' }}>Message deleted</em>
                ) : (
                  chat.lastMessage.content || 'Media attachment'
                )
              ) : (
                'Start a conversation'
              )}
            </span>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {chat.muted && <VolumeX size={14} style={{ color: 'var(--text-muted)' }} />}
            {chat.pinned && <Pin size={14} style={{ color: 'var(--text-muted)' }} />}
            {chat.unreadCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--accent-green)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center'
                }}
              >
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
