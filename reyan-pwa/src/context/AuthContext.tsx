import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState, User } from '../types';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import { db } from '../db/db';

interface AuthContextType extends AuthState {
  login: (usernameOrEmail: string, password: String) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem('reyan_access_token'),
    refreshToken: localStorage.getItem('reyan_refresh_token'),
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('reyan_access_token');
      if (token) {
        try {
          const currentUser = await api.getCurrentUser();
          setState({
            user: currentUser,
            accessToken: token,
            refreshToken: localStorage.getItem('reyan_refresh_token'),
            isAuthenticated: true,
            loading: false
          });

          // Store profile in Dexie DB
          await db.userProfile.put(currentUser);

          // Connect STOMP WebSocket
          wsService.connect(token);
        } catch (e) {
          // Stale or expired JWT token cleared automatically; user will re-login cleanly
          localStorage.removeItem('reyan_access_token');
          localStorage.removeItem('reyan_refresh_token');
          wsService.disconnect();
          setState({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false
          });
        }
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    initAuth();

    const handleAuthError = () => {
      logout();
    };
    window.addEventListener('reyan_auth_error', handleAuthError);
    return () => window.removeEventListener('reyan_auth_error', handleAuthError);
  }, []);

  const login = async (usernameOrEmail: string, password: String) => {
    const data = await api.login(usernameOrEmail, password);
    localStorage.setItem('reyan_access_token', data.accessToken);
    localStorage.setItem('reyan_refresh_token', data.refreshToken);

    setState({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
      loading: false
    });

    await db.userProfile.put(data.user);
    wsService.connect(data.accessToken);
    api.updatePresenceStatus(true).catch(() => {});
  };

  const register = async (formData: any) => {
    const data = await api.register(formData);
    localStorage.setItem('reyan_access_token', data.accessToken);
    localStorage.setItem('reyan_refresh_token', data.refreshToken);

    setState({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
      loading: false
    });

    await db.userProfile.put(data.user);
    wsService.connect(data.accessToken);
    api.updatePresenceStatus(true).catch(() => {});
  };

  const logout = async () => {
    const rToken = localStorage.getItem('reyan_refresh_token') || undefined;
    try {
      await api.logout(rToken);
    } catch (e) {
      // Ignore network failures on logout
    }

    localStorage.removeItem('reyan_access_token');
    localStorage.removeItem('reyan_refresh_token');
    wsService.disconnect();

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false
    });
  };

  const updateProfile = async (data: Partial<User>) => {
    const updated = await api.updateProfile(data);
    setState((prev) => ({ ...prev, user: updated }));
    await db.userProfile.put(updated);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
