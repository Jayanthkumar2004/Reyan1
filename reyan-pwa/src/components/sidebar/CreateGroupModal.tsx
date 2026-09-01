import React, { useState } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { X, Users, Search, Check } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const { createGroupChat, selectChat } = useChat();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const users = await api.searchUsers(query.trim());
      setSearchResults(users);
    } catch (e) {
      console.error('Group user search failed', e);
    }
  };

  const toggleSelectUser = (user: User) => {
    if (selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      alert('Group name is required');
      return;
    }
    if (selectedUsers.length === 0) {
      alert('Please select at least one member for the group');
      return;
    }
    setLoading(true);
    try {
      const memberIds = selectedUsers.map((u) => u.id);
      const group = await createGroupChat(groupName.trim(), memberIds, description.trim());
      await selectChat(group);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: '520px',
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
            <Users size={20} style={{ color: 'var(--accent-green)' }} />
            <h3 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)' }}>New Group Chat</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Group Name *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Project Alpha"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Description (Optional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Group description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Add Members ({selectedUsers.length} selected)
            </label>

            {selectedUsers.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {selectedUsers.map((user) => (
                  <span
                    key={user.id}
                    onClick={() => toggleSelectUser(user)}
                    style={{
                      backgroundColor: 'rgba(0, 168, 132, 0.15)',
                      color: 'var(--accent-green)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {user.fullName} <X size={12} />
                  </span>
                ))}
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '32px' }}
                placeholder="Search users to add..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto', marginTop: '8px' }}>
              {searchResults.map((user) => {
                const isSelected = selectedUsers.some((u) => u.id === user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleSelectUser(user)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--hover-bg)' : 'transparent'
                    }}
                  >
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{user.fullName} (@{user.username})</span>
                    {isSelected && <Check size={16} style={{ color: 'var(--accent-green)' }} />}
                  </div>
                );
              })}
            </div>
          </div>

          <button className="btn-primary" onClick={handleCreate} disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};
