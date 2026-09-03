import React, { useState } from 'react';
import { formatMediaUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { ChatItem } from './ChatItem';
import { UserSearchModal } from './UserSearchModal';
import { CreateGroupModal } from './CreateGroupModal';
import { MessageSquarePlus, Users, Settings as SettingsIcon, Search, Moon, Sun, MessageSquare, CircleDot } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  isMobileChatActive: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenProfile, onOpenSettings, isMobileChatActive }) => {
  const { user } = useAuth();
  const { chats, activeChat, selectChat, loadingChats } = useChat();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'CHATS' | 'GROUPS' | 'STATUS' | 'SETTINGS'>('CHATS');
  const [searchFilter, setSearchFilter] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);

  const filteredChats = chats.filter((chat) => {
    if (activeTab === 'GROUPS' && chat.type !== 'GROUP') return false;
    const title = chat.type === 'GROUP' ? chat.name : chat.otherUser?.fullName;
    return title?.toLowerCase().includes(searchFilter.toLowerCase());
  });

  const totalUnreadCount = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const toggleTheme = () => {
    setTheme(theme === 'DARK' ? 'LIGHT' : 'DARK');
  };

  return (
    <div className={`sidebar ${isMobileChatActive ? 'hidden-mobile' : ''}`}>
      {/* Top Header Bar */}
      <div className="sidebar-header">
        <div
          onClick={onOpenProfile}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div className="user-avatar-badge">
            {user?.avatarUrl ? (
              <img 
                src={formatMediaUrl(user.avatarUrl)} 
                alt={user.fullName} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=00a884&color=fff`;
                }}
              />
            ) : (
              user?.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2' }}>Reyan</h3>
            <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: '600' }}>● Active</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button className="btn-icon" onClick={() => setIsSearchOpen(true)} title="New Chat">
            <MessageSquarePlus size={20} />
          </button>
          <button className="btn-icon" onClick={() => setIsGroupOpen(true)} title="New Group">
            <Users size={20} />
          </button>
          <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'DARK' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="btn-icon" onClick={onOpenSettings} title="Settings">
            <SettingsIcon size={20} />
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="sidebar-search-bar">
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '36px', height: '38px', borderRadius: '19px', fontSize: '13px' }}
            placeholder="Search messages or contacts"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List Container */}
      <div className="sidebar-chat-list">
        {loadingChats ? (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading conversations...</p>
        ) : filteredChats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '14px', marginBottom: '12px' }}>No conversations found</p>
            <button className="btn-primary" onClick={() => setIsSearchOpen(true)} style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '20px' }}>
              Start New Chat
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChat?.id === chat.id}
              onClick={() => selectChat(chat)}
            />
          ))
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        <button
          className={`nav-item ${activeTab === 'CHATS' ? 'active' : ''}`}
          onClick={() => setActiveTab('CHATS')}
        >
          <div className="nav-icon-wrap">
            <MessageSquare size={20} />
            {totalUnreadCount > 0 && <span className="nav-badge">{totalUnreadCount}</span>}
          </div>
          <span>Chats</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'GROUPS' ? 'active' : ''}`}
          onClick={() => setActiveTab('GROUPS')}
        >
          <div className="nav-icon-wrap">
            <Users size={20} />
          </div>
          <span>Groups</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'STATUS' ? 'active' : ''}`}
          onClick={() => setIsGroupOpen(true)}
        >
          <div className="nav-icon-wrap">
            <CircleDot size={20} />
          </div>
          <span>New Group</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'SETTINGS' ? 'active' : ''}`}
          onClick={onOpenSettings}
        >
          <div className="nav-icon-wrap">
            <SettingsIcon size={20} />
          </div>
          <span>Settings</span>
        </button>
      </div>

      {/* Modals */}
      <UserSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CreateGroupModal isOpen={isGroupOpen} onClose={() => setIsGroupOpen(false)} />
    </div>
  );
};
