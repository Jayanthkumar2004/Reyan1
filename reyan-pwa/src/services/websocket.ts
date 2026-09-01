import { Client, IMessage } from '@stomp/stompjs';
import { Message, MessageDeliveryStatus, TypingEvent } from '../types';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8085/ws-direct';

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private isConnecting = false;
  private currentToken: string | null = null;
  private subscriptions: Map<string, any> = new Map();

  connect(token: string, onConnected?: () => void, onError?: (err: any) => void): void {
    if (this.currentToken === token && (this.isConnected || this.isConnecting)) {
      return;
    }

    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {}
      this.client = null;
    }

    this.currentToken = token;
    this.isConnected = false;
    this.isConnecting = true;
    this.subscriptions.clear();

    this.client = new Client({
      brokerURL: WS_BASE_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        token: token
      },
      debug: (str) => {
        // Console debug log for STOMP events
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000
    });

    this.client.onConnect = () => {
      this.isConnected = true;
      this.isConnecting = false;
      this.subscriptions.clear(); // Clear stale subscription keys on reconnect
      window.dispatchEvent(new Event('reyan_ws_connected'));
      if (onConnected) onConnected();
    };

    this.client.onStompError = (frame) => {
      this.isConnected = false;
      this.isConnecting = false;
      if (onError) onError(frame.headers['message']);
    };

    this.client.onWebSocketClose = () => {
      this.isConnected = false;
      this.isConnecting = false;
    };

    this.client.activate();
  }

  disconnect(): void {
    this.currentToken = null;
    this.isConnecting = false;
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {}
      this.client = null;
    }
    this.isConnected = false;
    this.subscriptions.clear();
  }

  subscribeToChat(chatId: string, onMessageReceived: (msg: Message) => void): void {
    if (!this.client || !this.isConnected) return;
    
    const topic = `/topic/chat/${chatId}`;
    if (this.subscriptions.has(topic)) {
      try {
        this.subscriptions.get(topic)?.unsubscribe();
      } catch (e) {}
      this.subscriptions.delete(topic);
    }

    const sub = this.client.subscribe(topic, (stompMessage: IMessage) => {
      try {
        const payload: Message = JSON.parse(stompMessage.body);
        onMessageReceived(payload);
      } catch (e) {
        console.error('Failed to parse STOMP message', e);
      }
    });

    this.subscriptions.set(topic, sub);
  }

  subscribeToTyping(chatId: string, onTypingReceived: (event: TypingEvent) => void): void {
    if (!this.client || !this.isConnected) return;

    const topic = `/topic/chat/${chatId}/typing`;
    if (this.subscriptions.has(topic)) {
      try {
        this.subscriptions.get(topic)?.unsubscribe();
      } catch (e) {}
      this.subscriptions.delete(topic);
    }

    const sub = this.client.subscribe(topic, (stompMessage: IMessage) => {
      try {
        const payload: TypingEvent = JSON.parse(stompMessage.body);
        onTypingReceived(payload);
      } catch (e) {
        console.error('Failed to parse typing event', e);
      }
    });

    this.subscriptions.set(topic, sub);
  }

  subscribeToMessageStatus(chatId: string, onStatusReceived: (event: any) => void): void {
    if (!this.client || !this.isConnected) return;

    const topic = `/topic/chat/${chatId}/status`;
    if (this.subscriptions.has(topic)) {
      try {
        this.subscriptions.get(topic)?.unsubscribe();
      } catch (e) {}
      this.subscriptions.delete(topic);
    }

    const sub = this.client.subscribe(topic, (stompMessage: IMessage) => {
      try {
        const payload = JSON.parse(stompMessage.body);
        onStatusReceived(payload);
      } catch (e) {
        console.error('Failed to parse status event', e);
      }
    });

    this.subscriptions.set(topic, sub);
  }

  subscribeToUserMessages(userId: string, onMessageReceived: (msg: Message) => void): void {
    if (!this.client || !this.isConnected) return;

    const topic = `/topic/user/${userId}/messages`;
    if (this.subscriptions.has(topic)) {
      try {
        this.subscriptions.get(topic)?.unsubscribe();
      } catch (e) {}
      this.subscriptions.delete(topic);
    }

    const sub = this.client.subscribe(topic, (stompMessage: IMessage) => {
      try {
        const payload: Message = JSON.parse(stompMessage.body);
        onMessageReceived(payload);
      } catch (e) {
        console.error('Failed to parse user message event', e);
      }
    });

    this.subscriptions.set(topic, sub);
  }

  subscribeToPresence(onPresenceReceived: (event: { userId: string; isOnline: boolean; lastSeen: string }) => void): void {
    if (!this.client || !this.isConnected) return;

    const topic = '/topic/presence';
    if (this.subscriptions.has(topic)) {
      try {
        this.subscriptions.get(topic)?.unsubscribe();
      } catch (e) {}
      this.subscriptions.delete(topic);
    }

    const sub = this.client.subscribe(topic, (stompMessage: IMessage) => {
      try {
        const payload = JSON.parse(stompMessage.body);
        onPresenceReceived(payload);
      } catch (e) {
        console.error('Failed to parse presence event', e);
      }
    });

    this.subscriptions.set(topic, sub);
  }

  unsubscribe(topic: string): void {
    const sub = this.subscriptions.get(topic);
    if (sub) {
      try {
        sub.unsubscribe();
      } catch (e) {}
      this.subscriptions.delete(topic);
    }
  }

  sendChatMessage(chatId: string, content: string, messageType = 'TEXT', mediaUrl?: string, replyToMessageId?: string, clientMessageId?: string): void {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket is not connected');
    }

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        chatId,
        content,
        messageType,
        mediaUrl,
        replyToMessageId,
        clientMessageId
      })
    });
  }

  sendTypingStatus(chatId: string, isTyping: boolean): void {
    if (!this.client || !this.isConnected) return;

    this.client.publish({
      destination: '/app/typing',
      body: JSON.stringify({
        chatId,
        typing: isTyping
      })
    });
  }

  sendPresenceStatus(isOnline: boolean): void {
    if (!this.client || !this.isConnected) return;

    this.client.publish({
      destination: '/app/presence',
      body: JSON.stringify({
        isOnline
      })
    });
  }

  markMessagesRead(chatId: string, messageId?: string): void {
    if (!this.client || !this.isConnected) return;

    this.client.publish({
      destination: '/app/message.read',
      body: JSON.stringify({
        chatId,
        messageId,
        status: 'READ'
      })
    });
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const wsService = new WebSocketService();
