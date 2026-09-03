import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { api, formatMediaUrl } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { Search, X, MessageSquare, UserCheck } from 'lucide-react';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({ isOpen, onClose }) => {
  const { createDirectChat, selectChat } = useChat();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers('');
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  const fetchUsers = async (searchQuery: string) => {
    setLoading(true);
    try {
      const users = await api.searchUsers(searchQuery);
      setResults(users);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    fetchUsers(val);
  };

  const handleStartChat = async (user: User) => {
    try {
      const chat = await createDirectChat(user.id);
      await selectChat(chat);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Could not start chat with user');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-header)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} style={{ color: 'var(--accent-green)' }} />
            <h3 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)' }}>New Direct Chat</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '38px' }}
              placeholder="Type username, name, or email..."
              value={query}
              onChange={handleInputChange}
              autoFocus
            />
          </div>
        </div>

        <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '0 16px 16px 16px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Loading users...</p>
          ) : results.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
              {query ? 'No users found matching query' : 'No registered users available'}
            </p>
          ) : (
            results.map((user) => (
              <div
                key={user.id}
                onClick={() => handleStartChat(user)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-green)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600'
                    }}
                  >
                    {user.avatarUrl ? (
                      <img 
                        src={formatMediaUrl(user.avatarUrl)} 
                        alt={user.fullName} 
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=00a884&color=fff`;
                        }}
                      />
                    ) : (
                      user.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{user.fullName}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{user.username}</p>
                  </div>
                </div>
                <MessageSquare size={18} style={{ color: 'var(--accent-green)' }} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
