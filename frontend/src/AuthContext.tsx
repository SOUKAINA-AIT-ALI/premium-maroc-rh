import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from './api';
import type { AuthUser } from './types';

// -------------------------------------------------------
// Types
// -------------------------------------------------------
interface AuthContextValue {
  currentUser: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

// -------------------------------------------------------
// Création du contexte
// -------------------------------------------------------
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const pendingEvaluationSearch = () => {
  const evaluationId = new URLSearchParams(window.location.search).get('evaluation_id');
  return evaluationId ? `?evaluation_id=${encodeURIComponent(evaluationId)}` : '';
};

// -------------------------------------------------------
// Provider
// -------------------------------------------------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const logout = useCallback(() => {
    api.setAccessToken(null);
    setAccessToken(null);
    setCurrentUser(null);
    window.history.replaceState({}, '', '/login');
  }, []);

  useEffect(() => {
    api.setUnauthorizedHandler(logout);
    if (!accessToken) window.history.replaceState({}, '', `/login${pendingEvaluationSearch()}`);
    return () => api.setUnauthorizedHandler(null);
  }, [accessToken, logout]);

  useEffect(() => {
    if (!accessToken) return;
    try {
      const encoded = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as { exp?: number };
      const delay = Math.max(0, (payload.exp ?? 0) * 1000 - Date.now());
      const timeout = window.setTimeout(logout, delay);
      return () => window.clearTimeout(timeout);
    } catch {
      logout();
    }
  }, [accessToken, logout]);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const session = await api.login(email, password);
    const user: AuthUser = {
      email: session.email,
      role: session.role,
      display_name: session.display_name,
      responsable_id: session.responsable_id,
    };
    api.setAccessToken(session.access_token);
    setAccessToken(session.access_token);
    setCurrentUser(user);
    window.history.replaceState({}, '', `/${pendingEvaluationSearch()}`);
    return user;
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      accessToken,
      isAuthenticated: currentUser !== null,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// -------------------------------------------------------
// Hook utilitaire
// -------------------------------------------------------
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un <AuthProvider>');
  }
  return context;
};
