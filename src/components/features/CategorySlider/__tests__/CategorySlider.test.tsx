import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import CategorySlider from '../CategorySlider';
import { getCategorySvg } from '../categorySvgs';
import { useCategoryStore } from '@stores/Category/Category';
import { Category } from '@stores/Category/types';
import { ThemeMode, useThemeStore } from '@stores/Theme';
import lightScheme from '@theme/light';

const mockNavigate = jest.fn();
let mockIsCompact = false;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

jest.mock('@lib/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ isCompact: mockIsCompact }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn() },
}));

function mockSvg(name: string) {
  const { Text: RNText } = jest.requireActual('react-native');
  const ReactActual = jest.requireActual('react');
  const Icon = () => ReactActual.createElement(RNText, null, `svg-${name}`);
  return { __esModule: true, default: Icon };
}

jest.mock('@assets/categories/beauty.svg', () => mockSvg('beauty'));
jest.mock('@assets/categories/health.svg', () => mockSvg('health'));
jest.mock('@assets/categories/home.svg', () => mockSvg('home'));
jest.mock('@assets/categories/miscellaneous.svg', () => mockSvg('misc'));
jest.mock('@assets/categories/pets.svg', () => mockSvg('pets'));
jest.mock('@assets/categories/repair.svg', () => mockSvg('repair'));

const buildCategory = (id: number, title: string): Category => ({
  id,
  title,
  active: true,
  iconName: 'home',
});

const flatten = (style: unknown): Record<string, unknown> =>
  Object.assign(
    {},
    ...(Array.isArray(style) ? style.flat(Infinity) : [style]).filter(Boolean),
  );

type Node = { props: { style?: unknown }; parent: Node | null };

const cellWidth = (node: Node | null): unknown => {
  let current = node;
  while (current) {
    const { width } = flatten(current.props.style);
    if (width !== undefined) return width;
    current = current.parent;
  }
  return undefined;
};

describe('CategorySlider', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockIsCompact = false;
    useThemeStore.setState({ theme: ThemeMode.LIGHT });
    useCategoryStore.setState({
      categories: [],
      fetchCategories: jest.fn(() => Promise.resolve()),
    });
  });

  it('deve mostrar o carregamento e buscar categorias quando a lista está vazia', async () => {
    const fetchCategories = jest.fn(() => Promise.resolve());
    useCategoryStore.setState({ fetchCategories });

    const { getByText, UNSAFE_getByType } = render(<CategorySlider />);
    const { ActivityIndicator } = jest.requireActual('react-native');

    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(fetchCategories).toHaveBeenCalledTimes(1);

    await act(async () => {});
    expect(getByText('Nenhuma categoria disponível')).toBeTruthy();
  });

  it('deve listar as categorias sem buscar de novo quando já existem', () => {
    const fetchCategories = jest.fn(() => Promise.resolve());
    useCategoryStore.setState({
      categories: [buildCategory(1, 'Saúde'), buildCategory(6, 'Pets')],
      fetchCategories,
    });

    const { getByText, getByLabelText } = render(<CategorySlider />);

    expect(fetchCategories).not.toHaveBeenCalled();
    expect(getByLabelText('Categoria Saúde')).toBeTruthy();
    expect(getByText('svg-health')).toBeTruthy();
    expect(getByText('svg-pets')).toBeTruthy();
  });

  it('deve navegar para as subcategorias ao tocar no card', () => {
    useCategoryStore.setState({ categories: [buildCategory(3, 'Reparos')] });

    const { getByLabelText } = render(<CategorySlider />);
    fireEvent.press(getByLabelText('Categoria Reparos'));

    expect(mockNavigate).toHaveBeenCalledWith('SubCategoryScreen', {
      categoryId: 3,
      categoryTitle: 'Reparos',
    });
  });

  it('deve usar duas colunas em telas compactas e três nas largas', () => {
    useCategoryStore.setState({ categories: [buildCategory(2, 'Beleza')] });

    const wide = render(<CategorySlider />);
    expect(
      cellWidth(wide.getByLabelText('Categoria Beleza') as unknown as Node),
    ).toBe(`${100 / 3}%`);
    wide.unmount();

    mockIsCompact = true;
    const compact = render(<CategorySlider />);
    expect(
      cellWidth(compact.getByLabelText('Categoria Beleza') as unknown as Node),
    ).toBe('50%');
  });

  it('deve trocar as cores no hover do tema claro', () => {
    useCategoryStore.setState({ categories: [buildCategory(5, 'Casa')] });
    const { getByLabelText, getByText } = render(<CategorySlider />);
    const card = getByLabelText('Categoria Casa');

    expect(flatten(getByText('Casa').props.style).color).toBe(
      lightScheme.primaryOrange,
    );

    fireEvent(card, 'hoverIn');
    expect(flatten(getByText('Casa').props.style).color).toBe(
      lightScheme.textOnImage,
    );

    fireEvent(card, 'hoverOut');
    expect(flatten(getByText('Casa').props.style).color).toBe(
      lightScheme.primaryOrange,
    );
  });

  it('deve usar o conteúdo claro no tema escuro, com e sem hover', () => {
    useThemeStore.setState({ theme: ThemeMode.DARK });
    useCategoryStore.setState({ categories: [buildCategory(4, 'Diversos')] });
    const { getByLabelText, getByText } = render(<CategorySlider />);

    expect(flatten(getByText('Diversos').props.style).color).toBe(
      lightScheme.textOnImage,
    );

    fireEvent(getByLabelText('Categoria Diversos'), 'hoverIn');
    expect(flatten(getByLabelText('Categoria Diversos').props.style)).toEqual(
      expect.objectContaining({ borderWidth: 1 }),
    );
  });

  it('deve usar borda grossa e texto preto no alto contraste', () => {
    useThemeStore.setState({ theme: ThemeMode.LIGHT_HI_CONTRAST });
    useCategoryStore.setState({ categories: [buildCategory(1, 'Saúde')] });
    const { getByLabelText, getByText } = render(<CategorySlider />);

    expect(flatten(getByLabelText('Categoria Saúde').props.style)).toEqual(
      expect.objectContaining({ borderWidth: 3 }),
    );
    expect(flatten(getByText('Saúde').props.style).color).toBe(
      lightScheme.primaryBlack,
    );

    fireEvent(getByLabelText('Categoria Saúde'), 'hoverIn');
    expect(flatten(getByText('Saúde').props.style).color).toBe(
      lightScheme.textOnImage,
    );
  });

  it('deve usar a ilustração "Diversos" para categorias desconhecidas', () => {
    expect(getCategorySvg(99)).toBe(getCategorySvg(4));
  });
});
