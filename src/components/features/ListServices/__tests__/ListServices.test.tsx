import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import ListServices from '..';
import { useServicesStore } from '@stores/Services/Services';
import { useCategoryStore } from '@stores/Category';
import { useSubCategoryStore } from '@stores/SubCategory';
import { initSSE } from '@lib/sse';
import type { ServiceItem } from '@stores/Services/Services';

/** Quarta-feira, 10h (o Jest roda em UTC). */
const NOW = new Date('2026-12-02T10:00:00Z');

const makeService = (
  id: number,
  overrides: Partial<ServiceItem> = {},
): ServiceItem => ({
  id,
  title: `Serviço ${id}`,
  description: `Descrição ${id}`,
  price_cents: 10000 + id,
  category_id: 1,
  subcategory_id: 11,
  availabilities: [{ day: 1, start: '08:00', end: '12:00' }],
  ...overrides,
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useIsFocused: () => mockFocused,
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@expo/vector-icons', () => ({ FontAwesome: () => null }));

jest.mock('@lib/sse', () => ({ initSSE: jest.fn() }));

let mockFocused = true;
let mockWidth = 1400;
jest.mock('@lib/hooks/useBreakpoint', () => {
  const actual = jest.requireActual('@lib/hooks/useBreakpoint');
  return {
    ...actual,
    useBreakpoint: () => actual.getBreakpointInfo(mockWidth),
  };
});

type ServicesState = ReturnType<typeof useServicesStore.getState>;

const fetchServices = jest.fn();
const fetchCategories = jest.fn();
const fetchSubCategoriesByCategoryId = jest.fn();

const setServices = (services: ServicesState['services'], loading = false) =>
  useServicesStore.setState({ services, loading });

const pressChip = (getAllByText: (t: string) => unknown[], label: string) =>
  fireEvent.press(getAllByText(label)[0] as never);

describe('ListServices', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    jest.clearAllMocks();
    mockFocused = true;
    mockWidth = 1400;
    (initSSE as jest.Mock).mockReturnValue(null);
    useServicesStore.setState({
      services: [],
      loading: false,
      fetchServices: fetchServices as unknown as ServicesState['fetchServices'],
    });
    useCategoryStore.setState({
      categories: [
        { id: 1, title: 'Limpeza', active: true, iconName: 'broom' },
        { id: 2, title: 'Elétrica', active: true, iconName: 'bolt' },
      ],
      fetchCategories,
    });
    useSubCategoryStore.setState({
      subCategories: [
        { id: 11, title: 'Faxina', category_id: 1 },
        { id: 21, title: 'Tomadas', category_id: 2 },
      ],
      fetchSubCategoriesByCategoryId,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve buscar categorias e serviços ao montar', () => {
    render(<ListServices />);

    expect(fetchCategories).toHaveBeenCalledTimes(1);
    expect(fetchServices).toHaveBeenCalledWith({});
  });

  it('deve mostrar o carregamento só na primeira carga', () => {
    setServices([], true);
    const { UNSAFE_getByType, rerender, UNSAFE_queryByType, getByText } =
      render(<ListServices />);

    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

    act(() => setServices([makeService(1)], true));
    rerender(<ListServices />);

    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    expect(getByText('Serviço 1')).toBeTruthy();
  });

  it('deve mostrar o vazio sem filtros', () => {
    const { getByText, queryByText } = render(<ListServices />);

    expect(getByText('Nenhum serviço disponível no momento.')).toBeTruthy();
    expect(queryByText('Limpar filtros')).toBeNull();
  });

  it('deve ignorar serviços sem horários', () => {
    setServices([makeService(1, { availabilities: [] })]);
    const { getByText } = render(<ListServices />);

    expect(getByText('Nenhum serviço disponível no momento.')).toBeTruthy();
  });

  it('deve filtrar por categoria e subcategoria', () => {
    const { getByText, queryByText } = render(<ListServices />);

    expect(queryByText('Faxina')).toBeNull();
    fireEvent.press(getByText('Limpeza'));

    expect(fetchSubCategoriesByCategoryId).toHaveBeenCalledWith(1);
    expect(fetchServices).toHaveBeenLastCalledWith({ category_id: 1 });
    expect(getByText('Faxina')).toBeTruthy();
    expect(queryByText('Tomadas')).toBeNull();

    fireEvent.press(getByText('Faxina'));
    expect(fetchServices).toHaveBeenLastCalledWith({ subcategory_id: 11 });

    fireEvent.press(getByText('Faxina'));
    expect(fetchServices).toHaveBeenLastCalledWith({ category_id: 1 });

    fireEvent.press(getByText('Limpeza'));
    expect(fetchServices).toHaveBeenLastCalledWith({});
    expect(queryByText('Faxina')).toBeNull();
  });

  it('deve voltar para todas as categorias', () => {
    const { getByText } = render(<ListServices />);

    fireEvent.press(getByText('Elétrica'));
    fireEvent.press(getByText('Todas'));

    expect(fetchServices).toHaveBeenLastCalledWith({});
  });

  it('deve filtrar por hoje e limpar os filtros no vazio', () => {
    const { getByText, getAllByText, queryByText } = render(<ListServices />);

    pressChip(getAllByText, 'Disponível hoje');

    expect(fetchServices).toHaveBeenLastCalledWith({ day: 3 });
    expect(
      getByText('Nenhum serviço encontrado com esses filtros.'),
    ).toBeTruthy();

    fireEvent.press(getByText('Limpar filtros'));

    expect(fetchServices).toHaveBeenLastCalledWith({});
    expect(queryByText('Limpar filtros')).toBeNull();
  });

  it('deve mostrar só os serviços disponíveis agora', () => {
    setServices([
      makeService(1, {
        availabilities: [{ day: 3, start: '09:00', end: '11:00' }],
      }),
      makeService(2),
    ]);
    const { getAllByText, queryByText, getByText } = render(<ListServices />);

    expect(getByText('Serviço 2')).toBeTruthy();
    pressChip(getAllByText, 'Disponível agora');

    expect(fetchServices).toHaveBeenLastCalledWith({ day: 3 });
    expect(getByText('Serviço 1')).toBeTruthy();
    expect(queryByText('Serviço 2')).toBeNull();
  });

  it('deve mostrar mais e menos serviços na grade', () => {
    setServices(Array.from({ length: 8 }, (_, i) => makeService(i + 1)));
    const { getByText, queryByText } = render(<ListServices />);

    expect(getByText('Serviço 6')).toBeTruthy();
    expect(queryByText('Serviço 7')).toBeNull();

    fireEvent.press(getByText('Mostrar mais 2 serviços'));
    expect(getByText('Serviço 8')).toBeTruthy();

    fireEvent.press(getByText('Mostrar menos'));
    expect(queryByText('Serviço 8')).toBeNull();
  });

  it('deve usar o singular quando falta um serviço na grade de duas colunas', () => {
    mockWidth = 800;
    setServices(Array.from({ length: 5 }, (_, i) => makeService(i + 1)));
    const { getByText, queryByText } = render(<ListServices />);

    expect(queryByText('Serviço 5')).toBeNull();
    expect(getByText('Mostrar mais 1 serviço')).toBeTruthy();
  });

  it('deve mostrar todos em carrossel no celular', () => {
    mockWidth = 375;
    setServices(Array.from({ length: 8 }, (_, i) => makeService(i + 1)));
    const { getByText, queryByText, UNSAFE_getByProps } = render(
      <ListServices />,
    );

    expect(getByText('Serviço 8')).toBeTruthy();
    expect(queryByText(/Mostrar mais/)).toBeNull();
    expect(
      UNSAFE_getByProps({ accessibilityLabel: 'Serviços disponíveis' }).type,
    ).toBe(ScrollView);
  });

  it('deve atualizar periodicamente com a tela em foco', () => {
    render(<ListServices />);
    expect(fetchServices).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(15000);
    });

    expect(fetchServices).toHaveBeenCalledTimes(2);
  });

  it('não deve atualizar periodicamente fora de foco', () => {
    mockFocused = false;
    render(<ListServices />);

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(fetchServices).toHaveBeenCalledTimes(1);
  });

  it('deve atualizar ao receber novo serviço pelo SSE e remover o ouvinte', () => {
    const listeners: Record<string, () => void> = {};
    const es = {
      addEventListener: jest.fn((event: string, fn: () => void) => {
        listeners[event] = fn;
      }),
      removeEventListener: jest.fn(() => {
        throw new Error('já fechado');
      }),
    };
    (initSSE as jest.Mock).mockReturnValue(es);
    const { unmount } = render(<ListServices />);

    act(() => listeners.new_service());
    expect(fetchServices).toHaveBeenCalledTimes(2);

    expect(() => unmount()).not.toThrow();
    expect(es.removeEventListener).toHaveBeenCalledWith(
      'new_service',
      listeners.new_service,
    );
  });
});
