import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FavoritosTab from '../FavoritosTab';
import { useFavoriteStore } from '@stores/Favorite';
import type { FavoriteProfessional } from '@stores/Favorite/types';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const favorite: FavoriteProfessional = {
  professionalId: 4,
  professionalName: 'Carlos Pintor',
  category: 'Reformas',
  serviceTitle: 'Pintura',
  addedAt: '2026-01-01T00:00:00.000Z',
};

describe('FavoritosTab', () => {
  const mockSync = jest.fn();
  const mockRemove = jest.fn();
  const mockAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useFavoriteStore.setState({
      favorites: [],
      loading: false,
      syncWithServer: mockSync,
      removeFavorite: mockRemove,
      addFavorite: mockAdd,
    });
  });

  it('deve sincronizar os favoritos ao abrir', () => {
    render(<FavoritosTab />);
    expect(mockSync).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o carregamento sem favoritos', () => {
    useFavoriteStore.setState({ loading: true });
    const { UNSAFE_queryByType } = render(<FavoritosTab />);
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
  });

  it('deve mostrar o vazio e levar para explorar serviços', () => {
    const { getByText } = render(<FavoritosTab />);

    expect(getByText('Nenhum favorito ainda')).toBeTruthy();
    fireEvent.press(getByText('Explorar serviços'));
    expect(mockNavigate).toHaveBeenCalledWith('Category');
  });

  it('deve listar o favorito e abrir o perfil', () => {
    useFavoriteStore.setState({
      favorites: [
        favorite,
        {
          ...favorite,
          professionalId: 5,
          professionalName: 'Ana',
          category: undefined,
          serviceTitle: undefined,
        },
      ],
    });
    const { getByText, getByLabelText, getAllByText } = render(
      <FavoritosTab />,
    );

    expect(getByText('Reformas')).toBeTruthy();
    expect(getAllByText(/Último serviço/).length).toBe(1);
    fireEvent.press(getByLabelText('Ver perfil de Carlos Pintor'));
    expect(mockNavigate).toHaveBeenCalledWith('PartnerProfile', { id: 4 });
  });

  it('deve remover e desfazer a remoção', async () => {
    mockRemove.mockResolvedValue(undefined);
    mockAdd.mockResolvedValue(undefined);
    useFavoriteStore.setState({ favorites: [favorite] });
    const { getByLabelText, getByText, queryByText, findByText } = render(
      <FavoritosTab />,
    );

    fireEvent.press(getByLabelText('Remover Carlos Pintor dos favoritos'));

    expect(await findByText('Carlos Pintor saiu dos favoritos.')).toBeTruthy();
    expect(mockRemove).toHaveBeenCalledWith(4);

    fireEvent.press(getByText('Desfazer'));
    await waitFor(() => expect(mockAdd).toHaveBeenCalledWith(favorite));
    expect(queryByText('Carlos Pintor saiu dos favoritos.')).toBeNull();
  });
});
