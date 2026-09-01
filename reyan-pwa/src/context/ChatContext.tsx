import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Chat, Message, TypingEvent } from '../types';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import { db } from '../db/db';
import { useAuth } from './AuthContext';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  loadingChats: boolean;
  loadingMessages: boolean;
  typingText: string | null;
  isNetworkOnline: boolean;
  selectChat: (chat: Chat | null) => Promise<void>;
  sendMessage: (content?: string, messageType?: string, mediaUrl?: string, replyToMessageId?: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  starMessage: (messageId: string) => Promise<void>;
  unstarMessage: (messageId: string) => Promise<void>;
  createDirectChat: (recipientId: string) => Promise<Chat>;
  createGroupChat: (name: string, memberIds: string[], description?: string) => Promise<Chat>;
  refreshChats: () => Promise<void>;
  sendTyping: (isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

let sharedAudioContext: AudioContext | null = null;
let hasUserGesture = false;

if (typeof window !== 'undefined') {
  const enableAudioOnGesture = () => {
    hasUserGesture = true;
    if (!sharedAudioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioContext = new AudioContextClass();
      }
    }
    if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().catch(() => {});
    }
  };
  window.addEventListener('pointerdown', enableAudioOnGesture, { passive: true });
  window.addEventListener('keydown', enableAudioOnGesture, { passive: true });
}

// Web Audio API Synthetic Chime Tone for incoming messages
const playNotificationSound = () => {
  if (!hasUserGesture || !sharedAudioContext || sharedAudioContext.state !== 'running') return;
  try {
    const ctx = sharedAudioContext;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.1);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Suppress audio policy exception before user interaction
  }
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [typingMap, setTypingMap] = useState<Record<string, string>>({});
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(navigator.onLine);

  // Keep a mutable ref of activeChat so STOMP callbacks always have latest value
  const activeChatRef = useRef<Chat | null>(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Request browser notification permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Connect STOMP WebSockets on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('reyan_access_token');
      if (token) {
        wsService.connect(token);
      }
      loadChats();
    } else {
      wsService.disconnect();
      setChats([]);
      setActiveChat(null);
      setMessages([]);
    }
  }, [isAuthenticated, user]);

  // Global user-level subscription for instant message notifications & active chat updates
  useEffect(() => {
    if (isAuthenticated && user) {
      const setupSubscriptions = () => {
        if (!user || !wsService.getIsConnected()) return;

        wsService.subscribeToUserMessages(user.id, (incomingMsg: Message) => {
          // Play notification chime & show native desktop notification
          if (incomingMsg.sender.id !== user.id) {
            playNotificationSound();
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(incomingMsg.sender.fullName, {
                body: incomingMsg.deleted ? 'This message was deleted' : incomingMsg.content || 'Media message',
                icon: incomingMsg.sender.avatarUrl || '/icons/icon-192x192.png'
              });
            }
          }

          // Live append message to active chat if open
          const currentActiveChat = activeChatRef.current;
          if (currentActiveChat && incomingMsg.chatId === currentActiveChat.id) {
            setMessages((prev) => {
              const index = prev.findIndex(
                (m) => m.id === incomingMsg.id || (incomingMsg.clientMessageId && m.clientMessageId === incomingMsg.clientMessageId)
              );
              if (index !== -1) {
                const updated = [...prev];
                updated[index] = incomingMsg;
                return updated;
              }
              return [...prev, incomingMsg];
            });
          }

          // Refresh chats to update snippet & timestamp
          loadChats();
        });

        // Presence WebSocket subscription for real-time online / offline status updates
        wsService.subscribeToPresence((event: { userId: string; isOnline: boolean; lastSeen: string }) => {
          const targetId = String(event.userId || '').toLowerCase();

          setChats((prev) =>
            prev.map((c) => {
              if (c.otherUser && String(c.otherUser.id).toLowerCase() === targetId) {
                return {
                  ...c,
                  otherUser: {
                    ...c.otherUser,
                    isOnline: event.isOnline,
                    online: event.isOnline,
                    lastSeen: event.lastSeen
                  }
                };
              }
              return c;
            })
          );

          if (activeChatRef.current && activeChatRef.current.otherUser && String(activeChatRef.current.otherUser.id).toLowerCase() === targetId) {
            setActiveChat((prev) => {
              if (!prev || !prev.otherUser) return prev;
              return {
                ...prev,
                otherUser: {
                  ...prev.otherUser,
                  isOnline: event.isOnline,
                  online: event.isOnline,
                  lastSeen: event.lastSeen
                }
              };
            });
          }
        });
      };

      setupSubscriptions();
      window.addEventListener('reyan_ws_connected', setupSubscriptions);
      return () => window.removeEventListener('reyan_ws_connected', setupSubscriptions);
    }
  }, [isAuthenticated, user]);

  // Page Visibility & App Recents Presence Handler
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const updatePresence = (isOnline: boolean) => {
      if (wsService.getIsConnected()) {
        wsService.sendPresenceStatus(isOnline);
      } else if (navigator.onLine) {
        api.updatePresenceStatus(isOnline).catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      updatePresence(isVisible);
      if (isVisible && activeChatRef.current) {
        api.markAsRead(activeChatRef.current.id).catch(() => {});
      }
    };

    const handlePageHide = () => {
      updatePresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('freeze', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('freeze', handlePageHide);
    };
  }, [isAuthenticated, user]);

  // Active Chat WebSocket subscriptions
  useEffect(() => {
    if (activeChat && isAuthenticated) {
      // Mark as read ONLY if page is currently visible
      if (document.visibilityState === 'visible') {
        api.markAsRead(activeChat.id).catch(() => {});
      }

      // Subscribe to live chat messages
      wsService.subscribeToChat(activeChat.id, (incomingMsg: Message) => {
        setMessages((prev) => {
          const index = prev.findIndex(
            (m) => m.id === incomingMsg.id || (incomingMsg.clientMessageId && m.clientMessageId === incomingMsg.clientMessageId)
          );
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = incomingMsg;
            return updated;
          }
          return [...prev, incomingMsg];
        });

        // Update active chat lastMessage
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChat.id
              ? { ...c, lastMessage: incomingMsg, updatedAt: new Date().toISOString() }
              : c
          )
        );

        // Play subtle sound and auto mark read ONLY IF visible
        if (incomingMsg.sender.id !== user?.id) {
          playNotificationSound();
          if (document.visibilityState === 'visible') {
            api.markAsRead(activeChat.id).catch(() => {});
          }
        }
      });

      // Subscribe to typing status
      wsService.subscribeToTyping(activeChat.id, (event: TypingEvent) => {
        if (event.userId !== user?.id) {
          setTypingMap((prev) => ({
            ...prev,
            [activeChat.id]: event.typing ? `${event.username} is typing...` : ''
          }));
        }
      });

      // Subscribe to status updates (sent, delivered, READ -> Blue Tick)
      wsService.subscribeToMessageStatus(activeChat.id, (statusEvent: any) => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.chatId === statusEvent.chatId) {
              return { ...m, status: statusEvent.status || 'READ' };
            }
            return m;
          })
        );
      });

      return () => {
        wsService.unsubscribe(`/topic/chat/${activeChat.id}`);
        wsService.unsubscribe(`/topic/chat/${activeChat.id}/typing`);
        wsService.unsubscribe(`/topic/chat/${activeChat.id}/status`);
      };
    }
  }, [activeChat, isAuthenticated, user]);

  const loadChats = async () => {
    setLoadingChats(true);
    try {
      if (navigator.onLine) {
        const fetched = await api.getChats();
        setChats(fetched);
        await db.chats.clear();
        await db.chats.bulkPut(fetched);
      } else {
        const cachedChats = await db.chats.toArray();
        setChats(cachedChats);
      }
    } catch (e) {
      console.warn('Failed to load chats online, loading from cache', e);
      const cachedChats = await db.chats.toArray();
      setChats(cachedChats);
    } finally {
      setLoadingChats(false);
    }
  };

  const selectChat = async (chat: Chat | null) => {
    setActiveChat(chat);
    if (!chat) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    try {
      if (navigator.onLine) {
        const fetchedMsgs = await api.getChatMessages(chat.id);
        setMessages(fetchedMsgs);
        await db.messages.where('chatId').equals(chat.id).delete();
        await db.messages.bulkPut(fetchedMsgs);
        await api.markAsRead(chat.id);
      } else {
        const cachedMsgs = await db.messages.where('chatId').equals(chat.id).sortBy('createdAt');
        setMessages(cachedMsgs);
      }
    } catch (e) {
      console.warn('Failed to load online messages, falling back to cache', e);
      const cachedMsgs = await db.messages.where('chatId').equals(chat.id).sortBy('createdAt');
      setMessages(cachedMsgs);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (
    content?: string,
    messageType = 'TEXT',
    mediaUrl?: string,
    replyToMessageId?: string
  ) => {
    if (!activeChat || !user) return;

    const clientMsgId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const optimisticMessage: Message = {
      id: clientMsgId,
      chatId: activeChat.id,
      sender: user,
      messageType: messageType as any,
      content,
      mediaUrl,
      status: 'SENT',
      edited: false,
      deleted: false,
      starred: false,
      createdAt: new Date().toISOString(),
      clientMessageId: clientMsgId,
      isPending: !navigator.onLine
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    if (navigator.onLine) {
      try {
        const serverMsg = await api.sendMessage({
          chatId: activeChat.id,
          content,
          messageType,
          mediaUrl,
          replyToMessageId,
          clientMessageId: clientMsgId
        });

        setMessages((prev) => {
          const alreadyPushedByWs = prev.some((m) => m.id === serverMsg.id && m.id !== clientMsgId);
          if (alreadyPushedByWs) {
            return prev.filter((m) => m.id !== clientMsgId);
          }
          return prev.map((m) => (m.id === clientMsgId ? serverMsg : m));
        });
        await db.messages.put(serverMsg);
      } catch (e) {
        console.error('Failed to send message online, queueing offline', e);
      }
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    const updated = await api.editMessage(messageId, content);
    setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
    await db.messages.put(updated);
  };

  const deleteMessage = async (messageId: string) => {
    await api.deleteMessageForEveryone(messageId);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, deleted: true, content: 'This message was deleted' } : m
      )
    );
  };

  const starMessage = async (messageId: string) => {
    await api.starMessage(messageId);
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, starred: true } : m)));
  };

  const unstarMessage = async (messageId: string) => {
    await api.unstarMessage(messageId);
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, starred: false } : m)));
  };

  const createDirectChat = async (recipientId: string) => {
    const chat = await api.createDirectChat(recipientId);
    setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)]);
    await db.chats.put(chat);
    return chat;
  };

  const createGroupChat = async (name: string, memberIds: string[], description?: string) => {
    const chat = await api.createGroupChat(name, memberIds, description);
    setChats((prev) => [chat, ...prev]);
    await db.chats.put(chat);
    return chat;
  };

  const sendTyping = (isTyping: boolean) => {
    if (activeChat) {
      wsService.sendTypingStatus(activeChat.id, isTyping);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages,
        loadingChats,
        loadingMessages,
        typingText: activeChat ? typingMap[activeChat.id] || null : null,
        isNetworkOnline,
        selectChat,
        sendMessage,
        editMessage,
        deleteMessage,
        starMessage,
        unstarMessage,
        createDirectChat,
        createGroupChat,
        refreshChats: loadChats,
        sendTyping
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
