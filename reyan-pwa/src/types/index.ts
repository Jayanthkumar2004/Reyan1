export type ChatType = 'DIRECT' | 'GROUP';
export type MemberRole = 'ADMIN' | 'MEMBER';
export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'VOICE' | 'SYSTEM';
export type MessageDeliveryStatus = 'SENT' | 'DELIVERED' | 'READ';
export type VisibilitySetting = 'EVERYONE' | 'CONTACTS' | 'NOBODY';
export type ThemeSetting = 'LIGHT' | 'DARK' | 'SYSTEM';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  about?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  description?: string;
  avatarUrl?: string;
  otherUser?: User;
  members: User[];
  lastMessage?: Message;
  unreadCount: number;
  muted: boolean;
  pinned: boolean;
  archived: boolean;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  sender: User;
  messageType: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaFilename?: string;
  mediaSize?: number;
  replyToMessage?: Message;
  status: MessageDeliveryStatus;
  edited: boolean;
  deleted: boolean;
  starred: boolean;
  createdAt: string;
  updatedAt?: string;
  clientMessageId?: string;
  isPending?: boolean;
  failed?: boolean;
}

export interface UserSettings {
  userId: string;
  lastSeenVisibility: VisibilitySetting;
  onlineVisibility: VisibilitySetting;
  profilePhotoVisibility: VisibilitySetting;
  aboutVisibility: VisibilitySetting;
  readReceipts: boolean;
  typingIndicator: boolean;
  notificationEnabled: boolean;
  darkMode: ThemeSetting;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface TypingEvent {
  chatId: string;
  userId: string;
  username: string;
  typing: boolean;
}

export interface PresenceEvent {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}
