import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUserStore } from '@stores/User';
import { User } from '@stores/User/types';

import { logger } from '@lib/logger';
interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token, fetchCurrentUser, signOut } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          await fetchCurrentUser();
        } catch (e) {
          logger.warn('[AuthProvider] Token expirado ou inválido:', e);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token, fetchCurrentUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        signOut,
        refreshUser: fetchCurrentUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
