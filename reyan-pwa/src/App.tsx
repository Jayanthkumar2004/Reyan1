import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AppLayout } from './layouts/AppLayout';

const MainContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isRegisterView, setIsRegisterView] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: 'var(--bg-app)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-green)',
          fontSize: '18px',
          fontWeight: '600'
        }}
      >
        Loading Reyan PWA...
      </div>
    );
  }

  if (!isAuthenticated) {
    return isRegisterView ? (
      <Register onToggleLogin={() => setIsRegisterView(false)} />
    ) : (
      <Login onToggleRegister={() => setIsRegisterView(true)} />
    );
  }

  return (
    <ChatProvider>
      <AppLayout />
    </ChatProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
