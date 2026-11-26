import React from 'react';
import { ActivityIndicator, Switch } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ServicesList from '../ServicesList';
import { useServicesStore, ServiceItem } from '@stores/Services/Services';
import { useUserStore } from '@stores/User';
import type { User } from '@stores/User/types';
import { useProfessionalStore } from '@stores/Professional';
import { useCategoryStore } from '@stores/Category';
import { useSubCategoryStore } from '@stores/SubCategory';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@lib/hooks/useServiceSearch', () => ({
  loadAllSubCategories: jest.fn(() =>
    Promise.resolve([{ id: 11, title: 'Chuveiro', category_id: 1 }]),
  ),
}));

const makeService = (overrides: Partial<ServiceItem> = {}): ServiceItem => ({
  id: 1,
  title: 'Troca de chuveiro',
  subcategory_id: 11,
  duration: 90,
  price_cents: 15000,
  active: true,
  availabilities: [{ day: 1, start: '08:00', end: '12:00' }],
  ...overrides,
});

describe('ServicesList', () => {
  const mockFetchMine = jest.fn();
  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchMine.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue({ id: 1 });
    useUserStore.setState({
      user: { id: 1, professional_id: 3 } as unknown as User,
    });
    useServicesStore.setState({
      myServices: [],
      fetchMyServices: mockFetchMine,
      updateService: mockUpdate,
    });
    useProfessionalStore.setState({
      fetchProfessionalById: jest.fn().mockResolvedValue(null),
      updateRadius: jest.fn(),
    });
    useCategoryStore.setState({ categories: [], fetchCategories: jest.fn() });
    useSubCategoryStore.setState({
      subCategories: [],
      fetchAllSubCategories: jest.fn(),
    });
  });

  it('deve pedir conta de colaborador quando não há profissional', () => {
    useUserStore.setState({ user: { id: 1 } as unknown as User });
    const { getByText, queryByText } = render(<ServicesList />);

    expect(getByText(/Entre com uma conta de colaborador/)).toBeTruthy();
    expect(queryByText('Novo serviço')).toBeNull();
    expect(mockFetchMine).not.toHaveBeenCalled();
  });

  it('deve carregar os serviços e mostrar o estado vazio', async () => {
    let resolve: () => void = () => undefined;
    mockFetchMine.mockReturnValueOnce(
      new Promise<void>((r) => {
        resolve = r;
      }),
    );
    const { UNSAFE_queryAllByType, findByText } = render(<ServicesList />);

    expect(UNSAFE_queryAllByType(ActivityIndicator).length).toBeGreaterThan(0);
    resolve();

    expect(await findByText('Nenhum serviço cadastrado')).toBeTruthy();
    expect(mockFetchMine).toHaveBeenCalled();
  });

  it('deve listar os serviços ativos primeiro com preço, duração e horários', async () => {
    useServicesStore.setState({
      myServices: [
        makeService({
          id: 2,
          title: 'Pintura',
          active: false,
          price_cents: undefined,
          price: 80,
          duration: 45,
          subcategory_id: undefined,
          availabilities: [],
        }),
        makeService(),
        makeService({
          id: 3,
          title: 'Reparo rápido',
          duration: 60,
          price_cents: undefined,
          price: undefined,
          subcategory_id: undefined,
        }),
      ],
    });
    const { findByText, getByText, getAllByText } = render(<ServicesList />);

    expect(await findByText('Chuveiro · 1h 30min')).toBeTruthy();
    expect(getByText('2 de 3 visíveis para os clientes')).toBeTruthy();
    expect(getByText(/150,00/)).toBeTruthy();
    expect(getByText(/80,00/)).toBeTruthy();
    expect(getByText('45 min')).toBeTruthy();
    expect(getByText('1h')).toBeTruthy();
    expect(
      getByText('Sem horários: clientes não conseguem agendar'),
    ).toBeTruthy();
    expect(getAllByText('Ativo')).toHaveLength(2);
    expect(getByText('Pausado')).toBeTruthy();
  });

  it('deve pausar um serviço pelo interruptor', async () => {
    useServicesStore.setState({ myServices: [makeService()] });
    const { findByLabelText } = render(<ServicesList />);

    const toggle = await findByLabelText(
      'Troca de chuveiro visível para clientes',
    );
    fireEvent(toggle, 'valueChange', false);

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith(1, { active: false }),
    );
  });

  it('deve avisar quando não consegue alterar o serviço', async () => {
    mockUpdate.mockRejectedValueOnce(new Error('falhou'));
    useServicesStore.setState({ myServices: [makeService()] });
    const { findByText, UNSAFE_getAllByType } = render(<ServicesList />);
    await findByText('Troca de chuveiro');

    fireEvent(UNSAFE_getAllByType(Switch)[0], 'valueChange', false);

    expect(
      await findByText('Não foi possível alterar o serviço. Tente novamente.'),
    ).toBeTruthy();
  });

  it('deve abrir o formulário novo e o de edição', async () => {
    useServicesStore.setState({ myServices: [makeService()] });
    const { findByLabelText, getByText, getAllByText, getByLabelText } = render(
      <ServicesList />,
    );

    fireEvent.press(await findByLabelText('Editar Troca de chuveiro'));
    expect(getByText('Editar serviço')).toBeTruthy();
    fireEvent.press(getByLabelText('Fechar sem salvar'));

    fireEvent.press(getAllByText('Novo serviço')[0]);
    expect(getByText('Cadastrar serviço')).toBeTruthy();
  });
});
