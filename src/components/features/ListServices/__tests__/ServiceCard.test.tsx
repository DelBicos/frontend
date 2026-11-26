import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ServiceCard, { formatAvailabilitySummary } from '../ServiceCard';
import { useCategoryStore } from '@stores/Category';
import type { ServiceItem } from '@stores/Services/Services';

const mockNavigate = jest.fn();
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
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@expo/vector-icons', () => ({ FontAwesome: () => null }));

describe('formatAvailabilitySummary', () => {
  it('deve retornar indefinido sem horários', () => {
    expect(formatAvailabilitySummary(undefined)).toBeUndefined();
    expect(formatAvailabilitySummary([])).toBeUndefined();
  });

  it('deve resumir os horários e indicar quando há mais', () => {
    const list = [
      { day: 1, start: '08:00', end: '12:00' },
      { day: 2, start: '13:00', end: '18:00' },
      { day: 9, start: '09:00', end: '10:00' },
    ];

    expect(formatAvailabilitySummary(list)).toBe(
      'Seg 08:00–12:00 • Ter 13:00–18:00 • 9 09:00–10:00',
    );
    expect(formatAvailabilitySummary(list, 2)).toBe(
      'Seg 08:00–12:00 • Ter 13:00–18:00 …',
    );
  });
});

describe('ServiceCard', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    mockNavigate.mockClear();
    useCategoryStore.setState({
      categories: [
        { id: 1, title: 'Limpeza', active: true, iconName: 'broom' },
      ],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve exibir a linha com preço, horários e categoria na navegação', () => {
    const { getByText, queryByText } = render(
      <ServiceCard service={makeService(1)} />,
    );

    expect(getByText('Serviço 1')).toBeTruthy();
    expect(getByText('Descrição 1')).toBeTruthy();
    expect(getByText('Seg 08:00–12:00')).toBeTruthy();
    expect(getByText(/100,01/)).toBeTruthy();
    expect(queryByText('Disponível agora')).toBeNull();

    fireEvent.press(getByText('Agendar'));

    expect(mockNavigate).toHaveBeenCalledWith('SubCategoryScreen', {
      categoryId: 1,
      categoryTitle: 'Limpeza',
      serviceId: 11,
    });
  });

  it('deve indicar disponível agora e sem disponibilidade na linha', () => {
    const { getByText, rerender } = render(
      <ServiceCard
        service={makeService(2, {
          availabilities: [{ day: 3, start: '09:00', end: '11:00' }],
        })}
      />,
    );

    expect(getByText('Disponível agora')).toBeTruthy();

    rerender(
      <ServiceCard
        service={makeService(3, {
          availabilities: [],
          description: undefined,
          price_cents: undefined,
        })}
      />,
    );

    expect(getByText('Sem disponibilidade')).toBeTruthy();
    expect(getByText('—')).toBeTruthy();
  });

  it('deve exibir o card em bloco com categoria e selo de agora', () => {
    const { getByText } = render(
      <ServiceCard
        variant="tile"
        service={makeService(4, {
          availabilities: [{ day: 3, start: '09:00', end: '11:00' }],
        })}
      />,
    );

    expect(getByText('Limpeza')).toBeTruthy();
    expect(getByText('Disponível agora')).toBeTruthy();
    expect(getByText('A partir de')).toBeTruthy();
    expect(getByText('Qua 09:00–11:00')).toBeTruthy();
  });

  it('deve usar textos padrão no card em bloco sem categoria e sem horários', () => {
    const { getByText, queryByText } = render(
      <ServiceCard
        variant="tile"
        service={makeService(5, {
          category_id: 99,
          subcategory_id: undefined,
          availabilities: undefined,
          description: '',
        })}
      />,
    );

    expect(queryByText('Limpeza')).toBeNull();
    expect(getByText('Sem horários cadastrados')).toBeTruthy();

    fireEvent.press(getByText('Agendar'));

    expect(mockNavigate).toHaveBeenCalledWith('SubCategoryScreen', {
      categoryId: 99,
      categoryTitle: 'Serviços',
      serviceId: 0,
    });
  });
});
