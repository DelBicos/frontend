import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import ChatRoomListPanel from '../ChatRoomListPanel';
import { useChatStore, Conversation } from '@stores/Chat';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

const makeRoom = (overrides: Partial<Conversation> = {}): Conversation => ({
  room_id: 1,
  appointment_id: 11,
  service_id: 21,
  service_title: 'Instalação de chuveiro',
  status: 'active',
  correspondent: { user_id: 2, name: 'Ana Cliente', avatar_uri: null },
  last_message_preview: 'Chego às 10h',
  last_message_at: new Date().toISOString(),
  ...overrides,
});

describe('ChatRoomListPanel', () => {
  const mockFetchRooms = jest.fn();
  const onSelectRoom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.setState({
      conversations: [],
      loadingRooms: false,
      error: null,
      fetchRooms: mockFetchRooms,
    });
  });

  const renderList = (selectedRoomId: number | null = null) =>
    render(
      <ChatRoomListPanel
        selectedRoomId={selectedRoomId}
        onSelectRoom={onSelectRoom}
      />,
    );

  it('deve buscar as conversas ao abrir', () => {
    renderList();
    expect(mockFetchRooms).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o carregamento só quando ainda não há conversas', () => {
    useChatStore.setState({ loadingRooms: true });
    const { UNSAFE_queryByType, queryByText } = renderList();

    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    expect(queryByText('Conversas')).toBeNull();
  });

  it('deve mostrar o erro da store', () => {
    useChatStore.setState({ error: 'Não foi possível carregar as conversas.' });
    const { getByText } = renderList();

    expect(getByText('Não foi possível carregar as conversas.')).toBeTruthy();
  });

  it('deve mostrar o estado vazio', () => {
    const { getByText } = renderList();
    expect(getByText(/Você ainda não tem conversas/)).toBeTruthy();
  });

  it('deve listar as conversas com nome, serviço, prévia e situação', () => {
    useChatStore.setState({
      conversations: [
        makeRoom(),
        makeRoom({
          room_id: 2,
          status: 'archived',
          correspondent: null,
          service_title: null,
          last_message_preview: null,
          last_message_at: '2024-03-05T12:00:00.000Z',
        }),
        makeRoom({
          room_id: 3,
          last_message_at: null,
          correspondent: {
            user_id: 4,
            name: 'Caio',
            avatar_uri: 'https://arquivos.exemplo.com/caio.jpg',
          },
        }),
      ],
    });
    const { getByText, getAllByText } = renderList();

    expect(getByText('Ana Cliente')).toBeTruthy();
    expect(getAllByText('Instalação de chuveiro')).toHaveLength(2);
    expect(getAllByText('Chego às 10h')).toHaveLength(2);
    expect(getByText('Conversa')).toBeTruthy();
    expect(getByText('Nenhuma mensagem ainda')).toBeTruthy();
    expect(getByText('Arquivada')).toBeTruthy();
    expect(
      getByText(
        new Date('2024-03-05T12:00:00.000Z').toLocaleDateString('pt-BR'),
      ),
    ).toBeTruthy();
    expect(getByText('Caio')).toBeTruthy();
  });

  it('deve avisar a conversa escolhida ao tocar', () => {
    const room = makeRoom();
    useChatStore.setState({ conversations: [room] });
    const { getByText } = renderList(1);

    fireEvent.press(getByText('Ana Cliente'));
    expect(onSelectRoom).toHaveBeenCalledWith(room);
  });

  it('deve forçar a atualização no pull-to-refresh', () => {
    useChatStore.setState({ conversations: [makeRoom()] });
    const { UNSAFE_getByType } = renderList();

    act(() => {
      UNSAFE_getByType(FlatList).props.onRefresh();
    });
    expect(mockFetchRooms).toHaveBeenLastCalledWith({ forceRefresh: true });
  });

  it('não deve atualizar de novo enquanto já carrega', () => {
    useChatStore.setState({ conversations: [makeRoom()], loadingRooms: true });
    const { UNSAFE_getByType } = renderList();

    act(() => {
      UNSAFE_getByType(FlatList).props.onRefresh();
    });
    expect(mockFetchRooms).toHaveBeenCalledTimes(1);
  });
});
