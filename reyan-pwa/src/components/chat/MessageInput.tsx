import React, { useRef, useState, useEffect } from 'react';
import { Message } from '../../types';
import { api } from '../../services/api';
import { Paperclip, Send, X, Image as ImageIcon, FileText } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content?: string, messageType?: string, mediaUrl?: string, replyToMessageId?: string) => Promise<void>;
  replyingTo: Message | null;
  onCancelReply: () => void;
  editingMessage: Message | null;
  onCancelEdit: () => void;
  onSaveEdit: (messageId: string, content: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  onSaveEdit,
  onTyping
}) => {
  const [text, setText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<any>(null);

  // Sync edit mode text
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content || '');
    }
  }, [editingMessage]);

  // Auto-resize textarea dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Trigger typing event
    onTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleSend = async () => {
    if (!text.trim() && !editingMessage) return;

    if (editingMessage) {
      await onSaveEdit(editingMessage.id, text.trim());
      onCancelEdit();
      setText('');
      return;
    }

    const contentToSend = text.trim();
    setText('');
    onTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(contentToSend, 'TEXT', undefined, replyingTo?.id);
    if (replyingTo) onCancelReply();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachments(false);
    setUploading(true);

    try {
      const res = await api.uploadMedia(file, isImage ? 'chat-media' : 'documents');
      const messageType = isImage ? 'IMAGE' : 'DOCUMENT';
      await onSendMessage(res.filename, messageType, res.mediaUrl, replyingTo?.id);
      if (replyingTo) onCancelReply();
    } catch (err: any) {
      alert(err.message || 'Media upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="message-input-container">
      {/* Reply or Edit Banner */}
      {(replyingTo || editingMessage) && (
        <div className="reply-edit-banner">
          <div className="reply-edit-content">
            <span className="reply-edit-title">
              {editingMessage ? 'Editing message' : `Replying to ${replyingTo?.sender.fullName}`}
            </span>
            <p className="reply-edit-preview">
              {editingMessage ? editingMessage.content : replyingTo?.content}
            </p>
          </div>
          <button className="btn-icon" onClick={editingMessage ? onCancelEdit : onCancelReply}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Attachment Menu Popup */}
      {showAttachments && (
        <div className="attachment-popup">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="attachment-btn"
          >
            <div className="attachment-icon photo">
              <ImageIcon size={20} />
            </div>
            <span style={{ fontSize: '11px' }}>Photos</span>
          </button>

          <button
            onClick={() => docInputRef.current?.click()}
            className="attachment-btn"
          >
            <div className="attachment-icon doc">
              <FileText size={20} />
            </div>
            <span style={{ fontSize: '11px' }}>Document</span>
          </button>
        </div>
      )}

      <input type="file" ref={fileInputRef} accept="image/*,video/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, true)} />
      <input type="file" ref={docInputRef} accept=".pdf,.doc,.docx,.zip,.txt" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, false)} />

      {/* Main Input Controls */}
      <div className="message-input-bar">
        <button className="btn-icon attachment-trigger" onClick={() => setShowAttachments(!showAttachments)} title="Attach File">
          <Paperclip size={22} />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          className="input-field message-textarea"
          placeholder={uploading ? 'Uploading media...' : 'Type a message'}
          value={text}
          disabled={uploading}
          onChange={handleTextChange}
          onKeyDown={handleKeyPress}
        />

        <button
          className="btn-primary send-button"
          onClick={handleSend}
          disabled={!text.trim() && !editingMessage}
          title="Send"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
