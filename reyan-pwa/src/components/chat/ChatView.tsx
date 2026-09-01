import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Message } from '../../types';
import { MessageSquare } from 'lucide-react';

interface ChatViewProps {
  onBackMobile: () => void;
  isMobileChatActive: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ onBackMobile, isMobileChatActive }) => {
  const { activeChat, messages, loadingMessages, sendMessage, editMessage, sendTyping } = useChat();
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  if (!activeChat) {
    return (
      <div className={`chat-view ${!isMobileChatActive ? 'hidden-mobile' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--hover-bg)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: 'var(--accent-green)'
            }}
          >
            <MessageSquare size={40} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>Reyan Web & PWA</h2>
          <p style={{ fontSize: '14px', maxWidth: '360px', margin: '0 auto', lineHeight: '1.4' }}>
            Send and receive real-time messages cross-platform. Select a conversation to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-view ${!isMobileChatActive ? 'hidden-mobile' : ''}`}>
      <ChatHeader chat={activeChat} onBack={onBackMobile} />

      <MessageList
        messages={messages}
        loading={loadingMessages}
        onReply={(msg) => setReplyingTo(msg)}
        onEdit={(msg) => setEditingMessage(msg)}
      />

      <MessageInput
        onSendMessage={sendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
        onSaveEdit={editMessage}
        onTyping={sendTyping}
      />
    </div>
  );
};
