import React from 'react';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import { useUserStore } from '@stores/User';
import type { User } from '@stores/User/types';
import HeaderWeb from '../Header.web';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  registerTokenProvider: jest.fn(),
}));

jest.mock('@assets/Local.svg', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View /> };
});
jest.mock('@assets/Search.svg', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View /> };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { High: 4 },
}));

jest.mock('@components/ui/MapComponent/MapComponent', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return {
    MapComponent: (props: {
      region: { latitude: number };
      onMapPress: (e: unknown) => void;
    }) => (
      <Pressable
        testID="mapa"
        onPress={() =>
          props.onMapPress({
            nativeEvent: { coordinate: { latitude: -1, longitude: -2 } },
          })
        }>
        <Text>{`regiao ${props.region.latitude}`}</Text>
      </Pressable>
    ),
  };
});

jest.mock('react-native-popup-menu', () => {
  const { Pressable, View } = jest.requireActual('react-native');
  return {
    Menu: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    MenuTrigger: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    MenuOptions: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    MenuOption: ({
      children,
      onSelect,
    }: {
      children: React.ReactNode;
      onSelect: () => void;
    }) => (
      <Pressable accessibilityRole="menuitem" onPress={onSelect}>
        {children}
      </Pressable>
    ),
  };
});

const mockLookup = jest.fn();
let mockLocation: Record<string, unknown> = {};
jest.mock('@lib/hooks/LocationContext', () => ({
  useLocation: () => mockLocation,
}));

let mockWidth = 1400;
jest.mock('@lib/hooks/useBreakpoint', () => {
  const actual = jest.requireActual('@lib/hooks/useBreakpoint');
  return {
    ...actual,
    useBreakpoint: () => actual.getBreakpointInfo(mockWidth),
  };
});

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    dispatch: mockDispatch,
    goBack: jest.fn(),
  }),
  useRoute: () => ({ params: {} }),
  CommonActions: { reset: (payload: unknown) => ({ type: 'RESET', payload }) },
}));

const location = Location as unknown as Record<string, jest.Mock>;
const mockSignOut = jest.fn();

const user = {
  id: 1,
  client_id: 1,
  name: 'Ana Souza',
  email: 'ana@x.com',
  phone: '',
  cpf: '',
  professional_id: 3,
} as User;

const renderHeader = (routeName = 'Feed') =>
  render(
    <HeaderWeb
      {...({ route: { name: routeName, key: routeName } } as unknown as NativeStackHeaderProps)}
    />,
  );

describe('Header (web)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWidth = 1400;
    mockLocation = {
      address: null,
      city: undefined,
      state: undefined,
      lookupByCoordinates: mockLookup,
      loading: false,
    };
    useThemeStore.setState({ theme: ThemeMode.LIGHT });
    useUserStore.setState({ user: null, avatarBase64: null, signOut: mockSignOut });
  });

  it('visitante ve links, entrar e criar conta', () => {
    const { getByText, getAllByRole } = renderHeader('Help');
    expect(getByText('Início')).toBeTruthy();
    expect(getByText('Ajuda')).toBeTruthy();
    expect(getByText('Definir local')).toBeTruthy();
    const ajuda = getAllByRole('link').find(
      (l) => (l.props as Record<string, unknown>)['aria-current'] === 'page',
    );
    expect(ajuda).toBeTruthy();

    fireEvent.press(getByText('Entrar'));
    expect(mockNavigate).toHaveBeenCalledWith('Login', undefined);
    fireEvent.press(getByText('Criar conta'));
    expect(mockNavigate).toHaveBeenCalledWith('Register', undefined);
    fireEvent.press(getByText('Categorias'));
    expect(mockNavigate).toHaveBeenCalledWith('Category', undefined);
  });

  it('logo leva ao inicio e troca o tema pelo menu', () => {
    useThemeStore.setState({ theme: ThemeMode.DARK });
    const { getByLabelText, getByText } = renderHeader();
    fireEvent.press(getByLabelText('DelBicos, página inicial'));
    expect(mockNavigate).toHaveBeenCalledWith('Feed', undefined);
    fireEvent.press(getByText('Alto contraste'));
    expect(useThemeStore.getState().theme).toBe(ThemeMode.LIGHT_HI_CONTRAST);
  });

  it('busca pelo texto digitado e limpa a busca', () => {
    const { getByLabelText, queryByLabelText } = renderHeader();
    fireEvent.press(getByLabelText('Buscar'));
    expect(mockNavigate).not.toHaveBeenCalled();

    fireEvent.changeText(getByLabelText('Buscar serviço'), '  pintor ');
    fireEvent(getByLabelText('Buscar serviço'), 'submitEditing');
    expect(mockNavigate).toHaveBeenCalledWith('SearchResult', { query: 'pintor' });

    fireEvent.press(getByLabelText('Limpar busca'));
    expect(queryByLabelText('Limpar busca')).toBeNull();
  });

  it('usuario logado ve o menu da conta e sai', () => {
    useUserStore.setState({ user });
    mockLocation = { ...mockLocation, city: 'Sorocaba', state: 'SP' };
    const { getByText, getByLabelText, queryByText } = renderHeader();
    expect(getByLabelText('Conta de Ana')).toBeTruthy();
    expect(getByText('ana@x.com')).toBeTruthy();
    expect(getByText('Agendamentos')).toBeTruthy();
    expect(getByText('Sorocaba - SP')).toBeTruthy();
    expect(queryByText('Entrar')).toBeNull();

    fireEvent.press(getByText('Meu perfil'));
    expect(mockNavigate).toHaveBeenCalledWith('ClientProfile', undefined);
    fireEvent.press(getByText('Meus agendamentos'));
    expect(mockNavigate).toHaveBeenCalledWith('MySchedules', undefined);
    fireEvent.press(getByText('Conversas'));
    expect(mockNavigate).toHaveBeenCalledWith('ClientProfile', { subroute: 'Conversas' });
    fireEvent.press(getByText('Painel do colaborador'));
    expect(mockNavigate).toHaveBeenCalledWith('ProfessionalTabs', undefined);

    fireEvent.press(getByText('Sair'));
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'RESET',
      payload: { index: 0, routes: [{ name: 'Home' }] },
    });
  });

  it('administrador ve painel e analytics', () => {
    useUserStore.setState({
      user: { ...user, admin: true, email: '', professional_id: undefined },
    });
    const { getByText, queryByText } = renderHeader('AdminAnalytics');
    expect(getByText('Painel')).toBeTruthy();
    expect(getByText('Analytics')).toBeTruthy();
    expect(queryByText('Agendamentos')).toBeNull();
    expect(queryByText('Painel do colaborador')).toBeNull();
  });

  it('em tela menor recolhe os links em um menu', () => {
    mockWidth = 800;
    const { getByLabelText, queryByText, getByText } = renderHeader('Category');
    expect(queryByText('Categorias')).toBeNull();
    fireEvent.press(getByLabelText('Abrir menu'));
    expect(getByText('Categorias')).toBeTruthy();
    expect(getByText('Entrar')).toBeTruthy();
    expect(getByLabelText('Tema Claro')).toBeTruthy();
    fireEvent.press(getByText('Quem somos'));
    expect(mockNavigate).toHaveBeenCalledWith('AboutUs', undefined);
    expect(queryByText('Quem somos')).toBeNull();
  });

  it('no celular o menu recolhido do usuario logado nao mostra entrar', () => {
    mockWidth = 400;
    useUserStore.setState({ user });
    const { getByLabelText, queryByText } = renderHeader();
    fireEvent.press(getByLabelText('Abrir menu'));
    expect(getByLabelText('Fechar menu')).toBeTruthy();
    expect(queryByText('Entrar')).toBeNull();
    expect(queryByText('Ana')).toBeNull();
  });

  it('abre o mapa no local salvo e confirma', async () => {
    mockLocation = {
      ...mockLocation,
      city: 'Sorocaba',
      state: 'SP',
      address: { lat: '-23.5', lon: '-47.4' },
    };
    mockLookup.mockResolvedValue(undefined);
    const { getByLabelText, getByText, queryByText } = renderHeader();
    await act(async () => {
      fireEvent.press(getByLabelText('Local: Sorocaba - SP. Alterar local'));
    });
    expect(getByText('Onde você está?')).toBeTruthy();
    expect(getByText('regiao -23.5')).toBeTruthy();
    await act(async () => {
      fireEvent.press(getByText('Usar este local'));
    });
    expect(mockLookup).toHaveBeenCalledWith(-23.5, -47.4);
    expect(queryByText('Onde você está?')).toBeNull();
  });

  it('usa a posicao do aparelho e permite ajustar no mapa', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -10, longitude: -20 },
    });
    mockLookup.mockRejectedValue(new Error('falhou'));
    const { getByLabelText, getByText, getByTestId } = renderHeader();
    await act(async () => {
      fireEvent.press(getByLabelText('Definir local'));
    });
    expect(getByText('regiao -10')).toBeTruthy();
    fireEvent.press(getByTestId('mapa'));
    await act(async () => {
      fireEvent.press(getByText('Usar este local'));
    });
    expect(mockLookup).toHaveBeenCalledWith(-1, -2);
    expect(
      getByText('Não foi possível identificar este local. Tente de novo.'),
    ).toBeTruthy();
    fireEvent.press(getByLabelText('Fechar'));
  });

  it('sem permissao usa Sao Paulo e pede para marcar no mapa', async () => {
    location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const { getByLabelText, getByText } = renderHeader();
    await act(async () => {
      fireEvent.press(getByLabelText('Definir local'));
    });
    expect(
      getByText('Sem permissão de localização. Toque no mapa para marcar onde você está.'),
    ).toBeTruthy();
    expect(getByText('regiao -23.5505')).toBeTruthy();
    fireEvent.press(getByText('Usar este local'));
    expect(mockLookup).not.toHaveBeenCalled();
  });

  it('quando a localizacao falha avisa e usa Sao Paulo', async () => {
    location.requestForegroundPermissionsAsync.mockRejectedValue(new Error('x'));
    const { getByLabelText, getByText } = renderHeader();
    await act(async () => {
      fireEvent.press(getByLabelText('Definir local'));
    });
    await waitFor(() =>
      expect(getByText('Toque no mapa para marcar onde você está.')).toBeTruthy(),
    );
  });

  it('mostra carregando no botao enquanto busca o local', async () => {
    mockLocation = { ...mockLocation, loading: true };
    location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const { getByLabelText, queryByText } = renderHeader();
    await act(async () => {
      fireEvent.press(getByLabelText('Definir local'));
    });
    expect(queryByText('Usar este local')).toBeNull();
  });
});
