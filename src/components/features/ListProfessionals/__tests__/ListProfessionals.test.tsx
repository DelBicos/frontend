import React from 'react';
import { Text, FlatList } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ListProfessionals, {
  getProfessionalColumns,
} from '../ListProfessionals';
import { useProfessionalStore } from '@stores/Professional';
import type { ListedProfessional } from '@stores/Professional/types';

jest.mock('@lib/helpers/httpClient', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

jest.mock('@lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

let mockAddress: { lat?: string; lon?: string } | null = null;
jest.mock('@lib/hooks/LocationContext', () => ({
  useLocation: () => ({ address: mockAddress }),
}));

let mockWidth = 400;
jest.mock('@lib/hooks/useBreakpoint', () => {
  const actual = jest.requireActual('@lib/hooks/useBreakpoint');
  return {
    ...actual,
    useBreakpoint: () => actual.getBreakpointInfo(mockWidth),
  };
});

jest.mock('@components/ui/ProfessionalCard', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ professional }: { professional: { name: string } }) => (
      <MockText>{professional.name}</MockText>
    ),
  };
});

const makeProfessional = (id: number): ListedProfessional => ({
  id,
  name: `Profissional ${id}`,
  category: 'Elétrica',
  rating: 4.5,
  ratingsCount: 10,
  imageUrl: '',
  location: 'Sorocaba',
  offeredServices: [],
});

const makePage = (start: number, size: number) =>
  Array.from({ length: size }, (_, i) => makeProfessional(start + i));

describe('getProfessionalColumns', () => {
  it('deve calcular as colunas pela largura do conteúdo', () => {
    expect(getProfessionalColumns(300)).toBe(1);
    expect(getProfessionalColumns(520)).toBe(2);
    expect(getProfessionalColumns(800)).toBe(3);
    expect(getProfessionalColumns(1100)).toBe(4);
  });
});

describe('ListProfessionals', () => {
  const fetchProfessionals = jest.fn();

  beforeEach(() => {
    fetchProfessionals.mockReset();
    mockAddress = null;
    mockWidth = 400;
    useProfessionalStore.setState({
      fetchProfessionals:
        fetchProfessionals as unknown as ReturnType<
          typeof useProfessionalStore.getState
        >['fetchProfessionals'],
    });
  });

  it('deve mostrar o carregamento inicial', () => {
    fetchProfessionals.mockReturnValue(new Promise(() => undefined));
    const { queryByText, UNSAFE_getByType, UNSAFE_queryByType } = render(
      <ListProfessionals />,
    );

    const { ActivityIndicator } = jest.requireActual('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(UNSAFE_queryByType(FlatList)).toBeNull();
    expect(queryByText('Nenhum profissional encontrado.')).toBeNull();
  });

  it('deve mostrar o estado vazio quando não há profissionais', async () => {
    fetchProfessionals.mockResolvedValue([]);
    const { findByText, queryByText } = render(<ListProfessionals />);

    expect(await findByText('Nenhum profissional encontrado.')).toBeTruthy();
    expect(queryByText('Isso é tudo por enquanto.')).toBeNull();
    expect(fetchProfessionals).toHaveBeenCalledWith(
      '',
      0,
      12,
      undefined,
      undefined,
    );
  });

  it('deve buscar com as coordenadas do endereço atual', async () => {
    mockAddress = { lat: '-23.5', lon: '-47.4' };
    fetchProfessionals.mockResolvedValue([]);
    const { findByText } = render(<ListProfessionals />);

    await findByText('Nenhum profissional encontrado.');
    expect(fetchProfessionals).toHaveBeenCalledWith('', 0, 12, -23.5, -47.4);
  });

  it('deve listar os profissionais e o fim da lista', async () => {
    fetchProfessionals.mockResolvedValue(makePage(1, 2));
    const { findByText, getByText } = render(
      <ListProfessionals listHeader={<Text>Cabeçalho</Text>} />,
    );

    expect(await findByText('Profissional 1')).toBeTruthy();
    expect(getByText('Profissional 2')).toBeTruthy();
    expect(getByText('Cabeçalho')).toBeTruthy();
    expect(getByText('Isso é tudo por enquanto.')).toBeTruthy();
  });

  it('deve carregar a próxima página ao chegar no fim da lista', async () => {
    mockWidth = 1400;
    fetchProfessionals
      .mockResolvedValueOnce(makePage(1, 12))
      .mockResolvedValueOnce(makePage(13, 1));
    const { findByText, UNSAFE_getByType, queryByText } = render(
      <ListProfessionals />,
    );

    await findByText('Profissional 1');
    expect(queryByText('Isso é tudo por enquanto.')).toBeNull();

    await act(async () => {
      fireEvent(UNSAFE_getByType(FlatList), 'onEndReached');
    });

    await waitFor(() =>
      expect(fetchProfessionals).toHaveBeenLastCalledWith(
        '',
        1,
        12,
        undefined,
        undefined,
      ),
    );
    expect(await findByText('Profissional 13')).toBeTruthy();
    expect(await findByText('Isso é tudo por enquanto.')).toBeTruthy();
  });

  it('deve mostrar o carregamento do rodapé enquanto busca mais', async () => {
    fetchProfessionals
      .mockResolvedValueOnce(makePage(1, 12))
      .mockReturnValueOnce(new Promise(() => undefined));
    const { findByText, UNSAFE_getByType, UNSAFE_getAllByType } = render(
      <ListProfessionals />,
    );

    await findByText('Profissional 1');
    await act(async () => {
      fireEvent(UNSAFE_getByType(FlatList), 'onEndReached');
    });

    const { ActivityIndicator } = jest.requireActual('react-native');
    await waitFor(() =>
      expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0),
    );
  });
});
