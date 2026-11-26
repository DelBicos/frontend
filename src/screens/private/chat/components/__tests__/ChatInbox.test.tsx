import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatInbox from '../ChatInbox';
import { useChatStore, Conversation, FetchMessagesResult } from '@stores/Chat';

const mockNavigate = jest.fn();
let mockWidth = 400;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock('@lib/hooks/useBreakpoint', () => {
  const actual = jest.requireActual('@lib/hooks/useBreakpoint');
  return {
    ...actual,
    useBreakpoint: () => actual.getBreakpointInfo(mockWidth),
  };
});

jest.mock('@hooks/useChatSocket', () => ({
  useChatSocket: () => ({ roomStatus: null, sendMessage: jest.fn() }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

const room: Conversation = {
  room_id: 7,
  appointment_id: 11,
  service_id: 21,
  service_title: 'Pintura de parede',
  status: 'active',
  correspondent: { user_id: 2, name: 'Ana Cliente', avatar_uri: null },
  last_message_preview: 'Oi',
  last_message_at: null,
};

const emptyPage: FetchMessagesResult = {
  messages: [],
  nextCursor: null,
  roomStatus: 'active',
  role: 'professional',
};

describe('ChatInbox', () => {
  const mockFetchMessages = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchMessages.mockResolvedValue(emptyPage);
    useChatStore.setState({
      conversations: [room],
      loadingRooms: false,
      error: null,
      fetchRooms: jest.fn(),
      fetchMessages: mockFetchMessages,
    });
  });

  it('deve abrir a conversa em tela cheia em telas estreitas', () => {
    mockWidth = 400;
    const { getByText, queryByText } = render(<ChatInbox />);

    expect(queryByText('Selecione uma conversa')).toBeNull();
    fireEvent.press(getByText('Ana Cliente'));

    expect(mockNavigate).toHaveBeenCalledWith('ChatThread', {
      roomId: 7,
      correspondent: room.correspondent,
      serviceTitle: 'Pintura de parede',
      roomStatus: 'active',
    });
  });

  it('deve mostrar lista e conversa lado a lado em telas largas', async () => {
    mockWidth = 1200;
    const { getByText, queryByText, getAllByText } = render(<ChatInbox />);

    expect(getByText('Selecione uma conversa')).toBeTruthy();
    fireEvent.press(getByText('Ana Cliente'));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(queryByText('Selecione uma conversa')).toBeNull();
    await waitFor(() =>
      expect(mockFetchMessages).toHaveBeenCalledWith(7, undefined, 20),
    );
    // Nome aparece na lista e no cabecalho da conversa aberta.
    expect(getAllByText('Ana Cliente')).toHaveLength(2);
  });
});
