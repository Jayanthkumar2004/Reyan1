import Dexie, { Table } from 'dexie';
import { Chat, Message, User, UserSettings } from '../types';

export interface PendingQueueItem {
  id?: number;
  clientMessageId: string;
  chatId: string;
  messageType: string;
  content?: string;
  mediaUrl?: string;
  replyToMessageId?: string;
  createdAt: string;
}

export class ReyanDatabase extends Dexie {
  chats!: Table<Chat, string>;
  messages!: Table<Message, string>;
  pendingQueue!: Table<PendingQueueItem, number>;
  userProfile!: Table<User, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super('ReyanLocalDB');
    this.version(1).stores({
      chats: 'id, type, updatedAt, pinned, archived',
      messages: 'id, chatId, createdAt, status, [chatId+createdAt]',
      pendingQueue: '++id, clientMessageId, chatId',
      userProfile: 'id, username, email',
      settings: 'userId'
    });
  }
}

export const db = new ReyanDatabase();
