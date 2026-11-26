import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SubCategoryScreen from '../SubCategoryScreen';
import { useSubCategoryStore } from '@stores/SubCategory';

const mockNavigate = jest.fn();
let mockParams: Record<string, unknown> = {};
let mockWidth = 375;

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@lib/hooks/useBreakpoint', () => {
  const actual = jest.requireActual('@lib/hooks/useBreakpoint');
  return {
    ...actual,
    useBreakpoint: () => actual.getBreakpointInfo(mockWidth),
  };
});

// O calendario real depende de medidas de layout; aqui so escolhe um dia.
jest.mock('react-native-calendars', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    LocaleConfig: { locales: {}, defaultLocale: '' },
    Calendar: ({
      onDayPress,
    }: {
      onDayPress: (day: { dateString: string }) => void;
    }) => (
      <Text onPress={() => onDayPress({ dateString: '2099-03-10' })}>
        Escolher 10/03
      </Text>
    ),
  };
});

jest.mock('@components/features/BookingSteps', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => ({ params: mockParams }),
}));

const subCategories = [
  { id: 10, title: 'Corte', category_id: 2 },
  { id: 11, title: 'Escova', category_id: 2 },
];

describe('SubCategoryScreen', () => {
  const fetchSubCategoriesByCategoryId = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();
    mockWidth = 375;
    mockParams = { categoryId: '2', categoryTitle: 'Beleza' };
    useSubCategoryStore.setState({
      subCategories,
      fetchSubCategoriesByCategoryId,
    });
  });

  it('carrega os serviços da categoria e exige serviço e dia', async () => {
    const { findByLabelText, getByRole, getByText } = render(
      <SubCategoryScreen />,
    );

    expect(await findByLabelText('Corte')).toBeTruthy();
    expect(fetchSubCategoriesByCategoryId).toHaveBeenCalledWith(2);
    expect(getByText('Escolha um serviço')).toBeTruthy();
    expect(getByText('Escolha um dia')).toBeTruthy();

    const button = getByRole('button', { name: /Ver horários disponíveis/ });
    expect(button.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(button);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('segue para os horários com serviço e dia escolhidos', async () => {
    mockParams = {
      categoryId: 2,
      professionalId: 7,
      professionalName: 'Rita',
    };
    const { findByLabelText, getByText, getAllByText } = render(
      <SubCategoryScreen />,
    );

    fireEvent.press(await findByLabelText('Escova'));
    fireEvent.press(getByText('Escolher 10/03'));
    expect(getAllByText('Escova').length).toBeGreaterThan(1);
    expect(getByText('Serviços de Rita nesta categoria.')).toBeTruthy();

    fireEvent.press(getByText('Ver horários disponíveis'));
    expect(mockNavigate).toHaveBeenCalledWith('SearchResult', {
      subCategoryId: 11,
      subCategoryTitle: 'Escova',
      date: '2099-03-10',
      professionalId: 7,
      professionalName: 'Rita',
    });
  });

  it('já seleciona o serviço vindo da rota', async () => {
    mockParams = { categoryId: 2, serviceId: '10' };
    const { findByLabelText } = render(<SubCategoryScreen />);

    const option = await findByLabelText('Corte');
    expect(option.props.accessibilityState?.checked).toBe(true);
  });

  it('usa o serviço único sem buscar a categoria', async () => {
    mockParams = {
      categoryId: -1,
      singleSubCategory: { id: 33, title: 'Pintura' },
    };
    const { getByLabelText, getByText } = render(<SubCategoryScreen />);

    expect(getByLabelText('Pintura').props.accessibilityState?.checked).toBe(
      true,
    );
    expect(fetchSubCategoriesByCategoryId).not.toHaveBeenCalled();

    fireEvent.press(getByText('Escolher 10/03'));
    fireEvent.press(getByText('Ver horários disponíveis'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'SearchResult',
      expect.objectContaining({
        subCategoryId: 33,
        subCategoryTitle: 'Pintura',
      }),
    );
  });

  it('seleciona sozinho quando a categoria tem um serviço só', async () => {
    useSubCategoryStore.setState({ subCategories: [subCategories[0]] });
    const { findByLabelText } = render(<SubCategoryScreen />);

    const option = await findByLabelText('Corte');
    await waitFor(() =>
      expect(option.props.accessibilityState?.checked).toBe(true),
    );
  });

  it('mostra a lista vazia', async () => {
    useSubCategoryStore.setState({ subCategories: [] });
    const { findByText } = render(<SubCategoryScreen />);

    expect(
      await findByText(
        'Nenhum serviço disponível nesta categoria por enquanto.',
      ),
    ).toBeTruthy();
  });

  it('não busca nada sem categoria', async () => {
    mockParams = {};
    useSubCategoryStore.setState({ subCategories: [] });
    const { findByText } = render(<SubCategoryScreen />);

    expect(
      await findByText(
        'Nenhum serviço disponível nesta categoria por enquanto.',
      ),
    ).toBeTruthy();
    expect(fetchSubCategoriesByCategoryId).not.toHaveBeenCalled();
  });

  it('mostra as colunas lado a lado no desktop', async () => {
    mockWidth = 1280;
    const { findByLabelText, getByText } = render(<SubCategoryScreen />);

    expect(await findByLabelText('Corte')).toBeTruthy();
    expect(getByText('2. Para qual dia?')).toBeTruthy();
  });
});
