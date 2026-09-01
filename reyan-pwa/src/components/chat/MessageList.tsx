import React, { useEffect, useRef } from 'react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, loading, onReply, onEdit }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Deduplicate messages by id or clientMessageId to prevent duplicate React keys
  const uniqueMessages = Array.from(
    new Map(
      messages.map((m) => [m.id || m.clientMessageId || `${Date.now()}-${Math.random()}`, m])
    ).values()
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [uniqueMessages.length]);

  const formatDateLabel = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}
    >
      {loading ? (
        <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Loading messages...</p>
      ) : uniqueMessages.length === 0 ? (
        <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '14px' }}>No messages here yet.</p>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>Send a message to start the conversation!</p>
        </div>
      ) : (
        uniqueMessages.map((message, index) => {
          const showDateHeader =
            index === 0 ||
            new Date(message.createdAt).toDateString() !== new Date(uniqueMessages[index - 1].createdAt).toDateString();

          return (
            <React.Fragment key={`${message.id || message.clientMessageId}-${index}`}>
              {showDateHeader && (
                <div style={{ textAlign: 'center', margin: '12px 0' }}>
                  <span
                    style={{
                      backgroundColor: 'var(--bg-header)',
                      color: 'var(--text-muted)',
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {formatDateLabel(message.createdAt)}
                  </span>
                </div>
              )}
              <MessageBubble message={message} onReply={onReply} onEdit={onEdit} />
            </React.Fragment>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
};
