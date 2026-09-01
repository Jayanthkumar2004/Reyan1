import React, { useState } from 'react';
import { formatMediaUrl } from '../../services/api';
import { Message } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Check, CheckCheck, Star, Edit3, Trash2, Reply, Copy, FileText, Download, ChevronDown, CheckSquare } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onReply, onEdit }) => {
  const { user } = useAuth();
  const { deleteMessage, starMessage, unstarMessage } = useChat();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isOutgoing = message.sender.id === user?.id;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setShowMenu(false);
    }
  };

  const handleToggleStar = () => {
    if (message.starred) {
      unstarMessage(message.id);
    } else {
      starMessage(message.id);
    }
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (confirm('Delete this message for everyone?')) {
      deleteMessage(message.id);
      setShowMenu(false);
    }
  };

  const renderStatusTicks = () => {
    if (!isOutgoing) return null;
    if (message.isPending) return <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Sending...</span>;
    if (message.status === 'READ') return <span title="Read (Double Blue Tick)"><CheckCheck size={16} className="status-tick read" /></span>;
    if (message.status === 'DELIVERED') return <span title="Delivered (Double Grey Tick)"><CheckCheck size={16} className="status-tick" /></span>;
    return <span title="Sent (Single Grey Tick)"><Check size={16} className="status-tick" /></span>;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOutgoing ? 'flex-end' : 'flex-start',
        marginBottom: '8px',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      <div
        className={`message-bubble ${isOutgoing ? 'message-outgoing' : 'message-incoming'}`}
        style={{ position: 'relative', paddingRight: '28px' }}
      >
        {/* Hover Action Menu Trigger */}
        {(isHovered || showMenu) && !message.deleted && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              zIndex: 2
            }}
            title="Message options"
          >
            <ChevronDown size={14} />
          </button>
        )}

        {/* Sender Name in Group */}
        {!isOutgoing && (
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-green)', display: 'block', marginBottom: '3px' }}>
            {message.sender.fullName}
          </span>
        )}

        {/* Reply Quote Preview */}
        {message.replyToMessage && (
          <div
            style={{
              borderLeft: '3px solid var(--accent-green)',
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              marginBottom: '6px'
            }}
          >
            <span style={{ fontWeight: '600', color: 'var(--accent-green)' }}>{message.replyToMessage.sender.fullName}</span>
            <p style={{ margin: 0, color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {message.replyToMessage.content}
            </p>
          </div>
        )}

        {/* Media Content */}
        {message.mediaUrl && message.messageType === 'IMAGE' && !message.deleted && (
          <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '6px' }}>
            <img src={formatMediaUrl(message.mediaUrl)} alt="attachment" style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'cover' }} />
          </div>
        )}

        {message.mediaUrl && message.messageType === 'DOCUMENT' && !message.deleted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '6px', marginBottom: '6px' }}>
            <FileText size={24} style={{ color: 'var(--accent-green)' }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {message.mediaFilename || 'Document file'}
              </span>
            </div>
            <a href={message.mediaUrl} target="_blank" rel="noreferrer" download style={{ color: 'var(--text-secondary)' }}>
              <Download size={18} />
            </a>
          </div>
        )}

        {/* Message Content Text */}
        {message.deleted ? (
          <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-muted)', margin: 0 }}>
            🚫 This message was deleted
          </p>
        ) : (
          <p style={{ fontSize: '14px', lineHeight: '1.4', margin: 0, whiteSpace: 'pre-wrap' }}>
            {message.content}
          </p>
        )}

        {/* Footer Meta info */}
        <div className="message-meta">
          {message.starred && <Star size={11} style={{ color: '#f5a623', fill: '#f5a623' }} />}
          {message.edited && !message.deleted && <span style={{ fontSize: '10px' }}>(edited)</span>}
          <span>{formatTime(message.createdAt)}</span>
          {renderStatusTicks()}
        </div>
      </div>

      {/* Context Action Menu Dropdown */}
      {showMenu && !message.deleted && (
        <div
          style={{
            position: 'absolute',
            top: '32px',
            [isOutgoing ? 'right' : 'left']: 0,
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            zIndex: 30,
            minWidth: '150px',
            overflow: 'hidden'
          }}
        >
          <div
            onClick={() => { onReply(message); setShowMenu(false); }}
            style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            <Reply size={14} /> Reply
          </div>
          <div
            onClick={handleCopy}
            style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            <Copy size={14} /> Copy Text
          </div>
          <div
            onClick={handleToggleStar}
            style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            <Star size={14} /> {message.starred ? 'Unstar Message' : 'Star Message'}
          </div>
          {isOutgoing && (
            <>
              <div
                onClick={() => { onEdit(message); setShowMenu(false); }}
                style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                <Edit3 size={14} /> Edit Message
              </div>
              <div
                onClick={handleDelete}
                style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Trash2 size={14} /> Delete for Everyone
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
