import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchResultScreen from '../SearchResultScreen';
import { useProfessionalStore } from '@stores/Professional';
import { useServicesStore, type ServiceItem } from '@stores/Services/Services';
import { ProfessionalResult } from '@components/features/ProfessionalResultCard';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);
let mockParams: Record<string, unknown> | undefined = {};
let mockAddress: { lat?: number | string; lng?: number | string } | null = null;

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@lib/hooks/LocationContext', () => ({
  useLocation: () => ({ address: mockAddress }),
}));

jest.mock('@components/features/ProfessionalResultCard', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({
      professional,
      times,
    }: {
      professional: { name: string };
      times: string[];
    }) => (
      <Text>
        {professional.name}: {times.join(',')}
      </Text>
    ),
  };
});

jest.mock('@components/features/ListServices/ServiceCard', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ service }: { service: { title: string } }) => (
      <Text>{service.title}</Text>
    ),
  };
});

jest.mock('@components/features/BookingSteps', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    canGoBack: mockCanGoBack,
  }),
  useRoute: () => ({ params: mockParams }),
}));

const DAY = '2099-03-10';

const professional = (
  overrides: Partial<ProfessionalResult>,
): ProfessionalResult => ({
  id: 1,
  name: 'Ana',
  serviceName: 'Faxina',
  serviceId: 5,
  rating: 4,
  ratingsCount: 3,
  priceFrom: 100,
  availableTimes: ['09:00', '10:00'],
  offeredServices: [],
  distance: 5,
  location: 'Centro',
  imageUrl: '',
  ...overrides,
});

const results = [
  professional({ id: 1, name: 'Ana', distance: 5, priceFrom: 100, rating: 4 }),
  professional({ id: 2, name: 'Bia', distance: 1, priceFrom: 300, rating: 5 }),
  professional({ id: 3, name: 'Caio', distance: 9, priceFrom: 50, rating: 3 }),
  professional({ id: 4, name: 'Sem horário', availableTimes: [] }),
];

const names = (texts: string[]) =>
  texts.map((t) => t.split(':')[0]).filter((t) => t.length > 0);

describe('SearchResultScreen', () => {
  const fetchProfessionalsByAvailability = jest.fn();
  const searchServicesSemantically = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { subCategoryId: 5, date: DAY };
    mockAddress = null;
    mockCanGoBack.mockReturnValue(true);
    fetchProfessionalsByAvailability.mockResolvedValue(results);
    useProfessionalStore.setState({ fetchProfessionalsByAvailability });
    useServicesStore.setState({ searchServicesSemantically });
  });

  describe('busca por texto', () => {
    it('lista os serviços encontrados', async () => {
      mockParams = { query: '  vazamento ' };
      searchServicesSemantically.mockResolvedValueOnce({
        services: [{ id: 1, title: 'Encanador' } as unknown as ServiceItem],
        total: 1,
        resultsLimited: true,
      });
      const { findByText, getByText } = render(<SearchResultScreen />);

      expect(await findByText('Encanador')).toBeTruthy();
      expect(searchServicesSemantically).toHaveBeenCalledWith('vazamento');
      expect(getByText('“vazamento”')).toBeTruthy();
      expect(
        getByText('1 resultado · exibindo os mais relevantes'),
      ).toBeTruthy();
    });

    it('mostra a lista vazia', async () => {
      mockParams = { query: 'nada' };
      searchServicesSemantically.mockResolvedValueOnce({
        services: [],
        total: 0,
        resultsLimited: false,
      });
      const { findByText } = render(<SearchResultScreen />);

      expect(
        await findByText(/Nenhum serviço relevante foi encontrado/),
      ).toBeTruthy();
      expect(await findByText('0 resultados')).toBeTruthy();
    });

    it.each([
      [
        429,
        'Muitas buscas realizadas. Aguarde alguns minutos e tente novamente.',
      ],
      [
        503,
        'A busca semântica está temporariamente indisponível. Tente novamente.',
      ],
      [500, 'Não foi possível buscar os serviços agora. Tente novamente.'],
    ])('mostra o erro do status %s', async (status, message) => {
      mockParams = { query: 'pia' };
      searchServicesSemantically.mockRejectedValueOnce({
        response: { status },
      });
      const { findByText } = render(<SearchResultScreen />);

      expect(await findByText(message)).toBeTruthy();
    });

    it('mostra o erro genérico sem resposta do servidor', async () => {
      mockParams = { query: 'pia' };
      searchServicesSemantically.mockRejectedValueOnce(new Error('rede'));
      const { findByText } = render(<SearchResultScreen />);

      expect(
        await findByText(
          'Não foi possível buscar os serviços agora. Tente novamente.',
        ),
      ).toBeTruthy();
    });
  });

  describe('profissionais disponíveis', () => {
    it('pede serviço e dia quando faltam parâmetros', async () => {
      mockParams = undefined;
      const { findByText, getByText } = render(<SearchResultScreen />);

      expect(
        await findByText(
          'Informe um serviço e um dia para encontrar profissionais.',
        ),
      ).toBeTruthy();
      expect(getByText('Algo deu errado')).toBeTruthy();
      expect(fetchProfessionalsByAvailability).not.toHaveBeenCalled();

      mockCanGoBack.mockReturnValue(false);
      fireEvent.press(getByText('Escolher outro dia'));
      expect(mockNavigate).toHaveBeenCalledWith('Category');
    });

    it('lista só quem tem horário e ordena pela avaliação', async () => {
      const { findAllByText, getByText, queryByText } = render(
        <SearchResultScreen />,
      );

      const cards = await findAllByText(/: /);
      expect(names(cards.map((c) => String(c.props.children[0])))).toEqual([
        'Bia',
        'Ana',
        'Caio',
      ]);
      expect(queryByText(/Sem horário/)).toBeNull();
      expect(getByText(/3\s+profissionais com horário livre/)).toBeTruthy();
      expect(getByText(/^Faxina · /)).toBeTruthy();
      expect(queryByText('Mais próximos')).toBeNull();
      expect(fetchProfessionalsByAvailability).toHaveBeenCalledWith(
        5,
        DAY,
        undefined,
        undefined,
      );
    });

    it('ordena por preço e por distância com localização', async () => {
      mockAddress = { lat: '-23.5', lng: '-47.4' };
      const { findAllByText, getByText, getAllByText } = render(
        <SearchResultScreen />,
      );

      let cards = await findAllByText(/: /);
      expect(names(cards.map((c) => String(c.props.children[0])))).toEqual([
        'Bia',
        'Ana',
        'Caio',
      ]);
      expect(fetchProfessionalsByAvailability).toHaveBeenCalledWith(
        5,
        DAY,
        -23.5,
        -47.4,
      );

      fireEvent.press(getByText('Menor preço'));
      cards = getAllByText(/: /);
      expect(names(cards.map((c) => String(c.props.children[0])))).toEqual([
        'Caio',
        'Ana',
        'Bia',
      ]);
    });

    it('mostra só o profissional vindo do perfil e permite ver todos', async () => {
      mockParams = {
        subCategoryId: 5,
        subCategoryTitle: 'Faxina completa',
        date: DAY,
        professionalId: '3',
        professionalName: 'Caio',
      };
      const { findByText, getByText, queryByText } = render(
        <SearchResultScreen />,
      );

      expect(await findByText('Horários de Caio')).toBeTruthy();
      expect(getByText(/1\s+profissional com horário livre/)).toBeTruthy();
      expect(queryByText(/^Ana/)).toBeNull();

      fireEvent.press(getByText('Ver outros profissionais'));
      expect(getByText('Escolha profissional e horário')).toBeTruthy();
      expect(getByText(/^Ana/)).toBeTruthy();
    });

    it('avisa quando o profissional não tem horário no dia', async () => {
      mockParams = { subCategoryId: 5, date: DAY, professionalId: 4 };
      const { findByText, getByText } = render(<SearchResultScreen />);

      expect(await findByText('Nenhum horário livre neste dia')).toBeTruthy();
      expect(
        getByText(/Este profissional não tem horários livres neste dia/),
      ).toBeTruthy();
      expect(getByText('Horários de profissional')).toBeTruthy();
    });

    it('avisa quando ninguém tem horário livre', async () => {
      fetchProfessionalsByAvailability.mockResolvedValueOnce(null);
      const { findByText, getByText } = render(<SearchResultScreen />);

      expect(
        await findByText(/Nenhum profissional tem horário livre/),
      ).toBeTruthy();
      expect(getByText(/^Serviço escolhido · /)).toBeTruthy();

      fireEvent.press(getByText('Trocar serviço ou dia'));
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('mostra o erro da busca de profissionais', async () => {
      fetchProfessionalsByAvailability.mockRejectedValueOnce(new Error('x'));
      const { findByText } = render(<SearchResultScreen />);

      expect(
        await findByText(
          'Não foi possível buscar profissionais agora. Tente novamente.',
        ),
      ).toBeTruthy();
    });
  });
});
