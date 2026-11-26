import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MenuNavegacao from '../MenuNavegacao';
import { ClientProfileSubRoutes } from '@screens/types';
import { useUserStore } from '@stores/User';
import type { User } from '@stores/User/types';
import { confirmAction } from '@lib/utils/confirmAction';

const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
const mockDispatch = jest.fn();
let mockRouteName = 'ProfileTab';
let mockParams: { subroute?: string } | undefined = {};
let mockWidth = 1200;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setParams: mockSetParams,
    dispatch: mockDispatch,
  }),
  useRoute: () => ({ name: mockRouteName, params: mockParams }),
  CommonActions: { reset: (arg: unknown) => ({ type: 'RESET', arg }) },
}));

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 800, scale: 1, fontScale: 1 }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

jest.mock('@lib/utils/confirmAction', () => ({
  confirmAction: jest.fn(),
}));

const mockConfirm = confirmAction as jest.MockedFunction<typeof confirmAction>;

describe('MenuNavegacao', () => {
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteName = 'ProfileTab';
    mockParams = {};
    mockWidth = 1200;
    useUserStore.setState({
      user: { id: 31, client_id: 31 } as unknown as User,
      signOut: mockSignOut,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve listar as seções e marcar "Dados da conta" por padrão', () => {
    mockParams = undefined;
    const { getByText, getAllByRole } = render(<MenuNavegacao />);

    expect(getByText('Conta')).toBeTruthy();
    expect(getByText('Atividade')).toBeTruthy();
    expect(getByText('Seja um colaborador')).toBeTruthy();
    const active = getAllByRole('link').filter(
      (l) => l.props['aria-current'] === 'page',
    );
    expect(active).toHaveLength(1);
  });

  it('deve marcar a subrota atual', () => {
    mockParams = { subroute: ClientProfileSubRoutes.Favoritos };
    const { getByText } = render(<MenuNavegacao />);
    expect(getByText('Favoritos')).toBeTruthy();
  });

  it('deve trocar a subrota ao tocar numa opção', () => {
    const { getByText } = render(<MenuNavegacao />);

    fireEvent.press(getByText('Endereços'));
    expect(mockSetParams).toHaveBeenCalledWith({
      subroute: ClientProfileSubRoutes.MeusEnderecos,
    });
  });

  it('deve abrir Conversas dentro do perfil no web largo', () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const { getByText } = render(<MenuNavegacao />);

    fireEvent.press(getByText('Conversas'));
    expect(mockSetParams).toHaveBeenCalledWith({
      subroute: ClientProfileSubRoutes.Conversas,
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('deve abrir a lista de conversas fora do web largo', () => {
    const { getByText } = render(<MenuNavegacao />);

    fireEvent.press(getByText('Conversas'));
    expect(mockNavigate).toHaveBeenCalledWith('ChatList');
  });

  it('deve abrir o painel quando já é colaborador', () => {
    useUserStore.setState({
      user: { id: 31, professional_id: 3 } as unknown as User,
    });
    const { getByText } = render(<MenuNavegacao />);

    fireEvent.press(getByText('Painel do colaborador'));
    expect(mockNavigate).toHaveBeenCalledWith('ProfessionalTabs', {
      screen: 'ProfessionalHomeTab',
    });
  });

  it('deve voltar para o app de cliente pelas abas', () => {
    mockRouteName = 'ProfessionalProfileTab';
    const { getByText } = render(<MenuNavegacao />);

    fireEvent.press(getByText('Usar como cliente'));
    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
      screen: 'FeedTab',
    });
  });

  it('deve voltar para o feed no web', () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    mockRouteName = 'ProfessionalProfileTab';
    const { getByText } = render(<MenuNavegacao />);

    fireEvent.press(getByText('Usar como cliente'));
    expect(mockNavigate).toHaveBeenCalledWith('Feed');
  });

  it('deve sair da conta depois de confirmar', async () => {
    mockConfirm.mockResolvedValue(true);
    const { getByText } = render(<MenuNavegacao />);

    fireEvent.press(getByText('Sair da conta'));

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'RESET',
      arg: { index: 0, routes: [{ name: 'Home' }] },
    });
  });

  it('não deve sair sem confirmação', async () => {
    mockConfirm.mockResolvedValue(false);
    const { getByText } = render(<MenuNavegacao />);

    fireEvent.press(getByText('Sair da conta'));

    await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
