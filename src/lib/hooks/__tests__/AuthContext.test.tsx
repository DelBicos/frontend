import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useUserStore } from '@stores/User';
import type { User } from '@stores/User/types';
import { logger } from '@lib/logger';
import { AuthProvider, useAuth } from '../AuthContext';

jest.mock('@lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const user = { id: 1, name: 'Ana' } as unknown as User;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AuthProvider', () => {
  it('sem token termina o carregamento sem buscar o usuario', async () => {
    const fetchCurrentUser = jest.fn();
    const signOut = jest.fn();
    useUserStore.setState({
      token: null,
      user: null,
      fetchCurrentUser,
      signOut,
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchCurrentUser).not.toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.signOut).toBe(signOut);
    expect(result.current.refreshUser).toBe(fetchCurrentUser);
  });

  it('com token atualiza o usuario e marca como autenticado', async () => {
    const fetchCurrentUser = jest.fn().mockResolvedValue(undefined);
    useUserStore.setState({ token: 'token-a', user, fetchCurrentUser });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchCurrentUser).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBe(user);
    expect(result.current.token).toBe('token-a');
  });

  it('registra aviso quando o token esta expirado', async () => {
    const failure = new Error('401');
    const fetchCurrentUser = jest.fn().mockRejectedValue(failure);
    useUserStore.setState({
      token: 'token-velho',
      user: null,
      fetchCurrentUser,
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(logger.warn).toHaveBeenCalledWith(
      '[AuthProvider] Token expirado ou inválido:',
      failure,
    );
    expect(result.current.isAuthenticated).toBe(false);
  });
});
