import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CategoryScreen from '../CategoryScreen';
import { useCategoryStore } from '@stores/Category/Category';
import { ThemeMode, useThemeStore } from '@stores/Theme';
import { SubCategory } from '@stores/SubCategory/types';

const mockNavigate = jest.fn();
const mockLoadAll = jest.fn<Promise<SubCategory[]>, []>();

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@lib/hooks/useServiceSearch', () => {
  const actual = jest.requireActual('@lib/hooks/useServiceSearch');
  return {
    ...actual,
    loadAllSubCategories: () => mockLoadAll(),
  };
});

jest.mock('@components/features/CategorySlider/categorySvgs', () => ({
  getCategorySvg: () => ({
    IconComponent: () => null,
    width: 10,
    height: 10,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

const categories = [
  { id: 1, title: 'Saúde', active: true, iconName: 'heartbeat' },
  { id: 2, title: 'Beleza', active: true, iconName: 'cut' },
  { id: 9, title: 'Vazia', active: true, iconName: 'shapes' },
];

const subs: SubCategory[] = [
  { id: 10, title: 'Massagem', category_id: 1 },
  { id: 11, title: 'Fisioterapia', category_id: 1 },
  { id: 20, title: 'Manicure', category_id: 2 },
];

describe('CategoryScreen', () => {
  const fetchCategories = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();
    useCategoryStore.setState({ categories, fetchCategories });
    useThemeStore.setState({ theme: ThemeMode.LIGHT });
    mockLoadAll.mockResolvedValue(subs);
  });

  it('mostra as categorias com seus serviços após carregar', async () => {
    const { findByText, getByText, getAllByText } = render(<CategoryScreen />);

    expect(await findByText('Massagem')).toBeTruthy();
    expect(getByText('Manicure')).toBeTruthy();
    expect(getAllByText('Saúde').length).toBeGreaterThan(0);
    expect(getByText('2 serviços')).toBeTruthy();
    expect(getByText(/3 serviços em 3 categorias/)).toBeTruthy();
    expect(fetchCategories).not.toHaveBeenCalled();
  });

  it('busca as categorias quando a store está vazia', async () => {
    useCategoryStore.setState({ categories: [] });
    const { findByText } = render(<CategoryScreen />);

    await findByText(/Escolha um serviço para ver datas/);
    await waitFor(() => expect(fetchCategories).toHaveBeenCalled());
  });

  it('mostra erro e permite tentar novamente', async () => {
    mockLoadAll.mockRejectedValueOnce(new Error('falhou'));
    const { findByText, getByText } = render(<CategoryScreen />);

    expect(
      await findByText('Não foi possível carregar os serviços.'),
    ).toBeTruthy();

    fireEvent.press(getByText('Tentar novamente'));
    expect(await findByText('Massagem')).toBeTruthy();
    expect(mockLoadAll).toHaveBeenCalledTimes(2);
  });

  it('abre o serviço escolhido na tela de subcategoria', async () => {
    const { findByText } = render(<CategoryScreen />);

    fireEvent.press(await findByText('Massagem'));
    expect(mockNavigate).toHaveBeenCalledWith('SubCategoryScreen', {
      categoryId: 1,
      categoryTitle: 'Saúde',
      serviceId: 10,
    });
  });

  it('abre a categoria pelo atalho de agendar', async () => {
    const { findByLabelText } = render(<CategoryScreen />);

    fireEvent.press(await findByLabelText('Agendar em Beleza'));
    expect(mockNavigate).toHaveBeenCalledWith('SubCategoryScreen', {
      categoryId: 2,
      categoryTitle: 'Beleza',
    });
  });

  it('filtra por categoria e desmarca ao tocar de novo', async () => {
    const { findByText, getAllByText, queryByText } = render(
      <CategoryScreen />,
    );
    await findByText('Massagem');

    fireEvent.press(getAllByText('Beleza')[0]);
    expect(queryByText('Massagem')).toBeNull();
    expect(queryByText('Manicure')).toBeTruthy();

    fireEvent.press(getAllByText('Beleza')[0]);
    expect(queryByText('Massagem')).toBeTruthy();

    fireEvent.press(getAllByText('Beleza')[0]);
    fireEvent.press(getAllByText('Todas')[0]);
    expect(queryByText('Massagem')).toBeTruthy();
  });

  it('busca serviços sem acento e mostra a contagem', async () => {
    const { findByText, getByLabelText, getByText } = render(
      <CategoryScreen />,
    );
    await findByText('Massagem');

    fireEvent.changeText(getByLabelText('Buscar serviço'), 'saude');
    expect(getByText('2 serviços encontrados')).toBeTruthy();

    fireEvent.changeText(getByLabelText('Buscar serviço'), 'manic');
    expect(getByText('1 serviço encontrado')).toBeTruthy();
    fireEvent.press(getByLabelText('Manicure, Beleza. Escolher data'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'SubCategoryScreen',
      expect.objectContaining({ serviceId: 20, categoryTitle: 'Beleza' }),
    );
  });

  it('aplica o filtro de categoria na busca', async () => {
    const { findByText, getByLabelText, getAllByText, getByText } = render(
      <CategoryScreen />,
    );
    await findByText('Massagem');

    fireEvent.press(getAllByText('Beleza')[0]);
    fireEvent.changeText(getByLabelText('Buscar serviço'), 'massagem');
    expect(getByText(/Nenhum serviço encontrado para/)).toBeTruthy();
  });

  it('leva à busca inteligente quando nada é encontrado', async () => {
    const { findByText, getByLabelText, getByText } = render(
      <CategoryScreen />,
    );
    await findByText('Massagem');

    const input = getByLabelText('Buscar serviço');
    fireEvent.changeText(input, '  vazamento na pia ');
    expect(getByText(/Nenhum serviço encontrado para/)).toBeTruthy();

    fireEvent(input, 'submitEditing');
    expect(mockNavigate).toHaveBeenCalledWith('SearchResult', {
      query: 'vazamento na pia',
    });

    mockNavigate.mockClear();
    fireEvent.press(getByText('Busca inteligente: “vazamento na pia”'));
    expect(mockNavigate).toHaveBeenCalledWith('SearchResult', {
      query: 'vazamento na pia',
    });
  });

  it('não navega para a busca inteligente com texto vazio', async () => {
    const { findByText, getByLabelText } = render(<CategoryScreen />);
    await findByText('Massagem');

    const input = getByLabelText('Buscar serviço');
    fireEvent.changeText(input, '   ');
    fireEvent(input, 'submitEditing');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('usa as cores de alto contraste no cabeçalho das seções', async () => {
    useThemeStore.setState({ theme: ThemeMode.LIGHT_HI_CONTRAST });
    const { findByText } = render(<CategoryScreen />);

    expect(await findByText('Massagem')).toBeTruthy();
  });
});
