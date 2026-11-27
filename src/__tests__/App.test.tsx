import React from 'react';
import { Platform } from 'react-native';
import { act, render } from '@testing-library/react-native';
import {
  registerTokenProvider,
  registerUnauthorizedHandler,
} from '@lib/helpers/httpClient';
import { useUserStore } from '@stores/User';
import { useThemeStore } from '@stores/Theme';
import { ThemeMode } from '@stores/Theme/types';
import { ClientProfileSubRoutes } from '@screens/types';
import { App } from '../App';

type NavigationProps = {
  onReady: () => void;
  onStateChange: () => void;
  theme: { dark: boolean };
};

let mockNavigationProps: NavigationProps | undefined;
const mockGetCurrentRoute = jest.fn();
const mockGetRootState = jest.fn();
const mockUseFonts = jest.fn();
const mockHideAsync = jest.fn(() => Promise.resolve());
const mockInitGA = jest.fn();
const mockInitClarity = jest.fn();
const mockSignOut = jest.fn();

jest.mock('@react-navigation/elements', () => ({ Assets: [] }));
jest.mock('expo-asset', () => ({
  Asset: { loadAsync: jest.fn(() => Promise.resolve()) },
}));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: () => mockHideAsync(),
}));
jest.mock('expo-font', () => ({ useFonts: () => mockUseFonts() }));
jest.mock('@screens/NavigationStack', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return {
    Navigation: (props: NavigationProps) => {
      mockNavigationProps = props;
      return <MockText>Navegação</MockText>;
    },
  };
});
jest.mock('@screens/navigationRef', () => ({
  navigationRef: {
    getCurrentRoute: () => mockGetCurrentRoute(),
    getRootState: () => mockGetRootState(),
  },
}));
// Sem medidas da tela no Jest, o provedor real não renderiza os filhos.
jest.mock('react-native-safe-area-context', () => {
  const { View: MockView } = jest.requireActual('react-native');
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: MockView,
    initialWindowMetrics: null,
  };
});
jest.mock('@lib/hooks/LocationContext', () => ({
  LocationProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@lib/hooks/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('react-native-popup-menu', () => ({
  MenuProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@components/features/Accessibility/VLibrasSetup', () => () => null);
jest.mock('@components/features/ChatBot/ChatWidget', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return { ChatWidget: () => <MockText>Assistente</MockText> };
});
jest.mock('@components/layout/BottomNav', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return function MockBottomNav() {
    return <MockText>Menu inferior</MockText>;
  };
});
jest.mock('../utils/ga-web', () => ({
  initGAWeb: (id: string) => mockInitGA(id),
}));
jest.mock('../utils/clarity', () => ({
  initClarityWeb: (id: string) => mockInitClarity(id),
}));
jest.mock('../config/varEnvs', () => ({
  GOOGLE_ANALYTICS_ID: 'G-1',
  CLARITY_ID: 'c-1',
}));
jest.mock('@lib/helpers/httpClient', () => ({
  registerTokenProvider: jest.fn(),
  registerUnauthorizedHandler: jest.fn(),
}));

// O App registra o token e o logout no cliente HTTP ao ser importado.
const mockRegisterTokenProvider = registerTokenProvider as jest.Mock;
const mockRegisterUnauthorizedHandler =
  registerUnauthorizedHandler as jest.Mock;
const mockEnv: { GOOGLE_ANALYTICS_ID: string; CLARITY_ID: string } =
  jest.requireMock('../config/varEnvs');
const originalOS = Platform.OS;
const setUser = (user: unknown) =>
  useUserStore.setState({
    user: user as ReturnType<typeof useUserStore.getState>['user'],
  });

describe('App', () => {
  beforeEach(() => {
    mockNavigationProps = undefined;
    mockUseFonts.mockReturnValue([true, null]);
    mockGetCurrentRoute.mockReturnValue({ name: 'Feed' });
    mockGetRootState.mockReturnValue({ routes: [] });
    mockInitGA.mockClear();
    mockInitClarity.mockClear();
    mockHideAsync.mockClear();
    setUser(null);
  });

  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('não mostra nada enquanto as fontes carregam ou falham', () => {
    mockUseFonts.mockReturnValue([false, null]);
    const loading = render(<App />);
    expect(loading.toJSON()).toBeNull();

    mockUseFonts.mockReturnValue([true, new Error('fonte')]);
    const failed = render(<App />);
    expect(failed.toJSON()).toBeNull();
  });

  it('registra o token do usuário e o logout no cliente HTTP', () => {
    const tokenProvider = mockRegisterTokenProvider.mock.calls[0][0];
    useUserStore.setState({ token: 'abc' });
    expect(tokenProvider()).toBe('abc');

    useUserStore.setState({ signOut: mockSignOut });
    mockRegisterUnauthorizedHandler.mock.calls[0][0]();
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('mostra o assistente para usuário logado fora das telas de conversa', () => {
    setUser({ id: 1 });
    const { getByText, queryByText } = render(<App />);
    expect(getByText('Navegação')).toBeTruthy();
    expect(getByText('Menu inferior')).toBeTruthy();

    act(() => mockNavigationProps?.onReady());
    expect(mockHideAsync).toHaveBeenCalled();
    expect(getByText('Assistente')).toBeTruthy();

    mockGetCurrentRoute.mockReturnValue({ name: 'ChatThread' });
    act(() => mockNavigationProps?.onStateChange());
    expect(queryByText('Assistente')).toBeNull();
  });

  it('esconde o assistente na aba de conversas do perfil', () => {
    setUser({ id: 1 });
    const { queryByText } = render(<App />);
    mockGetCurrentRoute.mockReturnValue({
      name: 'ClientProfile',
      params: { subroute: ClientProfileSubRoutes.Conversas },
    });
    act(() => mockNavigationProps?.onStateChange());
    expect(queryByText('Assistente')).toBeNull();
  });

  it('não mostra o assistente sem usuário logado', () => {
    const { queryByText } = render(<App />);
    act(() => mockNavigationProps?.onReady());
    expect(queryByText('Assistente')).toBeNull();
  });

  it('passa o tema escuro para a navegação', () => {
    useThemeStore.setState({ theme: ThemeMode.DARK });
    render(<App />);
    expect(mockNavigationProps?.theme.dark).toBe(true);
    useThemeStore.setState({ theme: ThemeMode.LIGHT });
  });

  it('na web inicia o Analytics e o Clarity e não usa o menu inferior', () => {
    Platform.OS = 'web';
    const { queryByText } = render(<App />);
    expect(mockInitGA).toHaveBeenCalledWith('G-1');
    expect(mockInitClarity).toHaveBeenCalledWith('c-1');
    expect(queryByText('Menu inferior')).toBeNull();
  });

  it('na web não inicia o que não tem identificador configurado', () => {
    Platform.OS = 'web';
    mockEnv.GOOGLE_ANALYTICS_ID = '';
    mockEnv.CLARITY_ID = '';
    render(<App />);
    expect(mockInitGA).not.toHaveBeenCalled();
    expect(mockInitClarity).not.toHaveBeenCalled();
    mockEnv.GOOGLE_ANALYTICS_ID = 'G-1';
    mockEnv.CLARITY_ID = 'c-1';
  });

  it('no app nativo não inicia o Analytics da web', () => {
    render(<App />);
    expect(mockInitGA).not.toHaveBeenCalled();
  });
});
