import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatListScreen from '../ChatListScreen';
import ChatThreadScreen from '../ChatThreadScreen';
import { useChatStore, FetchMessagesResult } from '@stores/Chat';
import { useThemeStore, ThemeMode } from '@stores/Theme';

const mockGoBack = jest.fn();
let mockParams: Record<string, unknown> = {};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: mockGoBack }),
  useRoute: () => ({ params: mockParams }),
  useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock('@hooks/useChatSocket', () => ({
  useChatSocket: () => ({ roomStatus: null, sendMessage: jest.fn() }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

const archivedPage: FetchMessagesResult = {
  messages: [],
  nextCursor: null,
  roomStatus: 'archived',
  role: 'client',
};

describe('ChatListScreen', () => {
  beforeEach(() => {
    useChatStore.setState({
      conversations: [],
      loadingRooms: false,
      error: null,
      fetchRooms: jest.fn(),
    });
  });

  it.each([ThemeMode.LIGHT, ThemeMode.LIGHT_HI_CONTRAST, ThemeMode.DARK])(
    'deve mostrar a caixa de entrada no tema %s',
    (theme) => {
      useThemeStore.setState({ theme });
      const { getByText } = render(<ChatListScreen />);
      expect(getByText('Conversas')).toBeTruthy();
    },
  );
});

describe('ChatThreadScreen', () => {
  const mockFetchMessages = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchMessages.mockResolvedValue(archivedPage);
    useChatStore.setState({ fetchMessages: mockFetchMessages });
  });

  it('deve abrir a sala da rota e voltar pelo botão', async () => {
    mockParams = {
      roomId: 33,
      correspondent: { user_id: 2, name: 'Bruno Pro', avatar_uri: null },
      serviceTitle: 'Conserto de torneira',
      roomStatus: 'archived',
    };
    const { getByText, getByLabelText, findByText } = render(
      <ChatThreadScreen />,
    );

    expect(getByText('Bruno Pro')).toBeTruthy();
    expect(getByText('Conserto de torneira')).toBeTruthy();
    expect(await findByText(/Conversa encerrada/)).toBeTruthy();
    expect(mockFetchMessages).toHaveBeenCalledWith(33, undefined, 20);

    fireEvent.press(getByLabelText('Voltar'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('deve usar valores padrão quando a rota não traz o correspondente', async () => {
    mockParams = { roomId: 34 };
    const { getByText } = render(<ChatThreadScreen />);

    expect(getByText('Conversa')).toBeTruthy();
    await waitFor(() =>
      expect(mockFetchMessages).toHaveBeenCalledWith(34, undefined, 20),
    );
  });
});
