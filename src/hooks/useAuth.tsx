import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi, clearAuthToken, getAuthToken, setAuthToken, type AuthUser } from "@/lib/api";

interface AuthContextType {
  user: (AuthUser & { email: string }) | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user } = await authApi.profile();
      setUser(user);
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateUser();
    // Listen to storage changes (multi-tab logout)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'tk_auth_token') {
        hydrateUser();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [hydrateUser]);

  const login = useCallback(async (token: string) => {
    setAuthToken(token);
    await hydrateUser();
  }, [hydrateUser]);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};