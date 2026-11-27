import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PartnerProfileScreen from '../PartnerProfile';
import { useProfessionalStore } from '@stores/Professional';
import { useFavoriteStore } from '@stores/Favorite';
import { useUserStore } from '@stores/User';
import { Professional } from '@stores/Professional/types';
import { User } from '@stores/User/types';

type TestNode = ReturnType<typeof render>['UNSAFE_root'];

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);
let mockParams: { id: number | string } = { id: 7 };

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    canGoBack: mockCanGoBack,
  }),
  useRoute: () => ({ params: mockParams }),
}));

const buildProfessional = (
  overrides: Partial<Professional> = {},
): Professional =>
  ({
    id: 7,
    user_id: 70,
    cpf: '00000000000',
    description: 'Eletricista com 10 anos de experiência.',
    createdAt: '2021-03-10T10:00:00.000Z',
    updatedAt: '2021-03-10T10:00:00.000Z',
    User: {
      id: 70,
      name: 'João Silva',
      email: 'joao@teste.com',
      avatar_uri: 'https://img/avatar.png',
      banner_uri: 'https://img/banner.png',
    } as unknown as User,
    MainAddress: {
      neighborhood: 'Centro',
      city: 'Sorocaba',
      state: 'SP',
    },
    service_radius_km: 15,
    verified: true,
    cancellations_count: 2,
    rating: 4.5,
    ratings_count: 2,
    Services: [
      {
        id: 1,
        title: 'Instalação de chuveiro',
        description: 'Troca e instalação.',
        price: '80.00',
        price_cents: 8000,
        duration: 90,
        banner_uri: 'https://img/servico.png',
        active: true,
        subcategory_id: 33,
        professional_id: 7,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 2,
        title: 'Tomada',
        price: '30.00',
        duration: 30,
        active: true,
        subcategory_id: 34,
        professional_id: 7,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 3,
        title: 'Inativo',
        price: '10.00',
        duration: 60,
        banner_uri: 'https://img/inativo.png',
        active: false,
        subcategory_id: 35,
        professional_id: 7,
        createdAt: '',
        updatedAt: '',
      },
    ],
    Gallery: [
      {
        id: 1,
        professional_id: 7,
        url: 'https://img/g1.png',
        description: 'Obra',
      },
      { id: 2, professional_id: 7, url: 'https://img/servico.png' },
    ],
    Appointments: [
      {
        id: 100,
        rating: 5,
        review: 'Excelente trabalho',
        createdAt: '2024-01-10T10:00:00.000Z',
        Client: { User: { name: 'Maria', avatar_uri: 'https://img/m.png' } },
        Service: { title: 'Tomada' },
      },
      {
        id: 101,
        rating: 4,
        updatedAt: '2024-02-10T10:00:00.000Z',
        Client: { User: { name: '' } },
      },
      {
        id: 102,
        Client: { User: { name: 'Sem nota' } },
      },
    ],
    ...overrides,
  }) as Professional;

describe('PartnerProfileScreen', () => {
  const fetchProfessionalById = jest.fn();
  const addFavorite = jest.fn(() => Promise.resolve());
  const removeFavorite = jest.fn(() => Promise.resolve());
  let favorited = false;

  const setProfessional = (professional: Professional | null) => {
    fetchProfessionalById.mockImplementation(() => {
      useProfessionalStore.setState({ selectedProfessional: professional });
      return Promise.resolve(professional);
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { id: 7 };
    favorited = false;
    mockCanGoBack.mockReturnValue(true);
    setProfessional(buildProfessional());
    useProfessionalStore.setState({
      selectedProfessional: null,
      fetchProfessionalById,
    });
    useFavoriteStore.setState({
      isFavorite: () => favorited,
      addFavorite,
      removeFavorite,
    });
    useUserStore.setState({
      user: { id: 1, name: 'Cliente' } as unknown as User,
    });
  });

  it('carrega o profissional pelo id da rota e mostra os dados', async () => {
    mockParams = { id: '7' };
    const { findByText, getByText, getByLabelText } = render(
      <PartnerProfileScreen />,
    );

    // O primeiro render da suite carrega os modulos de icones e demora mais.
    expect(await findByText('João Silva', {}, { timeout: 10000 })).toBeTruthy();
    expect(getByText('4,5')).toBeTruthy();
    expect(fetchProfessionalById).toHaveBeenCalledWith(7);
    expect(getByText('2 cancelamentos pelo profissional')).toBeTruthy();
    expect(getByText('Centro, Sorocaba')).toBeTruthy();
    expect(getByLabelText('Foto de João Silva')).toBeTruthy();
    expect(getByText('Instalação de chuveiro')).toBeTruthy();
    expect(getByText(/1h 30min/)).toBeTruthy();
    expect(getByText(/ 30 min$/)).toBeTruthy();
  });

  it('mostra que não encontrou o profissional e volta', async () => {
    setProfessional(null);
    const { findByText } = render(<PartnerProfileScreen />);

    fireEvent.press(await findByText('Voltar'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('vai para a home quando não há tela para voltar', async () => {
    setProfessional(null);
    mockCanGoBack.mockReturnValue(false);
    const { findByText } = render(<PartnerProfileScreen />);

    fireEvent.press(await findByText('Voltar'));
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });

  it('agenda um serviço com o profissional', async () => {
    const { findByLabelText } = render(<PartnerProfileScreen />);

    fireEvent.press(await findByLabelText('Agendar Tomada com João Silva'));
    expect(mockNavigate).toHaveBeenCalledWith('SubCategoryScreen', {
      categoryId: -1,
      categoryTitle: 'Tomada',
      serviceId: 34,
      singleSubCategory: { id: 34, title: 'Tomada' },
      professionalId: 7,
      professionalName: 'João Silva',
    });
  });

  it('favorita o profissional', async () => {
    const { findByLabelText } = render(<PartnerProfileScreen />);

    fireEvent.press(await findByLabelText('Favoritar João Silva'));
    expect(addFavorite).toHaveBeenCalledWith(
      expect.objectContaining({
        professionalId: 7,
        professionalName: 'João Silva',
        professionalAvatar: 'https://img/avatar.png',
        serviceTitle: 'Instalação de chuveiro',
      }),
    );
  });

  it('remove dos favoritos quando já favoritado', async () => {
    favorited = true;
    const { findByLabelText } = render(<PartnerProfileScreen />);

    fireEvent.press(await findByLabelText('Remover João Silva dos favoritos'));
    expect(removeFavorite).toHaveBeenCalledWith(7);
  });

  it('volta pelo botão sobre a capa', async () => {
    const { findByLabelText } = render(<PartnerProfileScreen />);

    fireEvent.press(await findByLabelText('Voltar'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('não permite favoritar sem login', async () => {
    useUserStore.setState({ user: null });
    const { findByText, queryByLabelText } = render(<PartnerProfileScreen />);

    await findByText('João Silva');
    expect(queryByLabelText('Favoritar João Silva')).toBeNull();
  });

  it('mostra o aviso do dono e leva à edição de serviços', async () => {
    useUserStore.setState({
      user: { id: 70, name: 'João', professional_id: 7 } as unknown as User,
    });
    const { findByText, queryByText } = render(<PartnerProfileScreen />);

    expect(
      await findByText('Este é o seu perfil, como os clientes veem.'),
    ).toBeTruthy();
    expect(queryByText('Agendar')).toBeNull();

    fireEvent.press(await findByText('Editar serviços'));
    expect(mockNavigate).toHaveBeenCalledWith('ProfessionalTabs', {
      screen: 'ProfessionalServicesTab',
    });
  });

  it('mostra a aba sobre com os fatos do profissional', async () => {
    const { findByLabelText, getByText } = render(<PartnerProfileScreen />);

    fireEvent.press(await findByLabelText('Sobre'));
    expect(getByText('Eletricista com 10 anos de experiência.')).toBeTruthy();
    expect(getByText('Centro, Sorocaba - SP')).toBeTruthy();
    expect(getByText('Até 15 km de distância')).toBeTruthy();
    expect(getByText('2021')).toBeTruthy();
  });

  it('mostra a aba sobre sem descrição nem endereço', async () => {
    setProfessional(
      buildProfessional({
        description: undefined,
        MainAddress: undefined,
        service_radius_km: undefined,
        createdAt: '',
        rating: undefined,
        cancellations_count: 1,
        verified: false,
        User: {
          id: 70,
          name: 'joão Silva',
        } as unknown as User,
      }),
    );
    const { findByLabelText, getByText } = render(<PartnerProfileScreen />);

    fireEvent.press(await findByLabelText('Sobre'));
    expect(getByText('joão ainda não escreveu uma apresentação.')).toBeTruthy();
    expect(getByText('Sem limite de distância')).toBeTruthy();
    expect(getByText('Novo no DelBicos')).toBeTruthy();
    expect(getByText('1 cancelamento pelo profissional')).toBeTruthy();
    expect(getByText('J')).toBeTruthy();
  });

  it('mostra as avaliações com a nota média', async () => {
    const { findByLabelText, getByText, getByLabelText } = render(
      <PartnerProfileScreen />,
    );

    fireEvent.press(await findByLabelText('Avaliações, 2'));
    expect(
      getByLabelText('Nota média 4,5 de 5, com 2 avaliações'),
    ).toBeTruthy();
    expect(getByText('Excelente trabalho')).toBeTruthy();
    expect(getByText('Cliente')).toBeTruthy();
    expect(getByLabelText('5 estrelas: 1')).toBeTruthy();
  });

  it('mostra os estados vazios das abas', async () => {
    setProfessional(
      buildProfessional({
        Services: [],
        Gallery: undefined,
        Appointments: [{ id: 1, Client: { User: { name: 'X' } } }],
      }),
    );
    const { findByLabelText, getByText } = render(<PartnerProfileScreen />);

    expect(await findByLabelText('Serviços, 0')).toBeTruthy();
    expect(getByText('Nenhum serviço disponível no momento.')).toBeTruthy();

    fireEvent.press(await findByLabelText('Galeria, 0'));
    expect(getByText('Nenhuma foto na galeria ainda.')).toBeTruthy();

    fireEvent.press(await findByLabelText('Avaliações, 0'));
    expect(getByText('Ainda sem avaliações')).toBeTruthy();
  });

  it('mostra uma avaliação no singular', async () => {
    setProfessional(
      buildProfessional({
        Appointments: [
          {
            id: 1,
            rating: 3,
            Client: { User: { name: 'Ana' } },
          },
        ],
      }),
    );
    const { findByLabelText, getByText } = render(<PartnerProfileScreen />);

    fireEvent.press(await findByLabelText('Avaliações, 1'));
    expect(getByText('1 avaliação')).toBeTruthy();
  });

  it('abre a galeria com as fotos sem repetição', async () => {
    const {
      findByLabelText,
      getByLabelText,
      getByText,
      queryByText,
      UNSAFE_root,
    } = render(<PartnerProfileScreen />);

    fireEvent.press(await findByLabelText('Galeria, 2'));
    const withLayout = UNSAFE_root.findAll(
      (node: TestNode) => typeof node.props.onLayout === 'function',
    );
    fireEvent(withLayout[withLayout.length - 1], 'layout', {
      nativeEvent: { layout: { width: 400 } },
    });

    fireEvent.press(getByLabelText('Abrir foto 1 de 2: Obra'));
    expect(getByText('1 de 2')).toBeTruthy();
    expect(getByText('Obra')).toBeTruthy();

    fireEvent.press(getByLabelText('Próxima foto'));
    expect(getByText('2 de 2')).toBeTruthy();

    fireEvent.press(getByLabelText('Foto anterior'));
    expect(getByText('1 de 2')).toBeTruthy();

    fireEvent.press(getByLabelText('Fechar galeria'));
    await waitFor(() => expect(queryByText('1 de 2')).toBeNull());
  });
});
