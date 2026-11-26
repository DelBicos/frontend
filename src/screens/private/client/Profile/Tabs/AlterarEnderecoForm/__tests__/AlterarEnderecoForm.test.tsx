import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AlterarEnderecoForm from '../AlterarEnderecoForm';
import { Address, useAddressStore } from '@stores/Address';
import { useUserStore } from '@stores/User';
import { confirmAction } from '@lib/utils/confirmAction';
import type { User } from '@stores/User/types';
import type { AddressFormData } from '@components/features/AddressForm/AddressForm';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

jest.mock('@lib/utils/confirmAction', () => ({
  confirmAction: jest.fn(),
}));

// O formulario real consulta CEP e IBGE; aqui so preenche os campos.
jest.mock('@components/features/AddressForm/AddressForm', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    AddressForm: ({
      setValue,
    }: {
      setValue: (name: keyof AddressFormData, value: string) => void;
    }) => (
      <>
        <Text
          onPress={() => {
            setValue('cep', '01310-100');
            setValue('street', 'Av. Paulista');
            setValue('number', '1000');
            setValue('complement', 'Ap 1');
            setValue('neighborhood', 'Bela Vista');
            setValue('city', 'São Paulo');
            setValue('state', 'SP');
          }}>
          Preencher endereço
        </Text>
      </>
    ),
  };
});

const mockConfirm = confirmAction as jest.MockedFunction<typeof confirmAction>;

const makeAddress = (overrides: Partial<Address> = {}): Address => ({
  id: 1,
  lat: 0,
  lng: 0,
  street: 'Rua das Flores',
  number: '10',
  complement: null,
  neighborhood: 'Centro',
  city: 'Sorocaba',
  state: 'SP',
  country_iso: 'BR',
  postal_code: '18000000',
  isPrimary: false,
  ...overrides,
});

describe('AlterarEnderecoForm', () => {
  const mockFetch = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockSetPrimary = jest.fn();
  const mockAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({ user: { id: 31 } as unknown as User });
    useAddressStore.setState({
      addresses: [],
      isLoading: false,
      error: null,
      fetchAddressesByUserId: mockFetch,
      updateAddress: mockUpdate,
      deleteAddress: mockDelete,
      setPrimaryAddress: mockSetPrimary,
      addAddress: mockAdd,
    });
  });

  it('deve buscar os endereços do usuário ao abrir', () => {
    render(<AlterarEnderecoForm />);
    expect(mockFetch).toHaveBeenCalledWith(31);
  });

  it('não deve buscar sem usuário logado', () => {
    useUserStore.setState({ user: null });
    render(<AlterarEnderecoForm />);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('deve mostrar o carregamento enquanto não há endereços', () => {
    useAddressStore.setState({ isLoading: true });
    const { UNSAFE_queryByType, queryByText } = render(<AlterarEnderecoForm />);

    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    expect(queryByText('Nenhum endereço salvo')).toBeNull();
  });

  it('deve mostrar o erro e tentar de novo', () => {
    useAddressStore.setState({ error: 'Falha na conexão' });
    const { getByText } = render(<AlterarEnderecoForm />);

    expect(getByText('Algo deu errado')).toBeTruthy();
    expect(getByText('Falha na conexão')).toBeTruthy();
    fireEvent.press(getByText('Tentar de novo'));
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('deve mostrar o estado vazio com o botão de adicionar', () => {
    const { getByText, queryByText } = render(<AlterarEnderecoForm />);

    expect(getByText('Nenhum endereço salvo')).toBeTruthy();
    expect(queryByText('Novo endereço')).toBeNull();
  });

  it('deve listar o endereço principal primeiro', () => {
    useAddressStore.setState({
      addresses: [
        makeAddress({ id: 1, street: 'Rua A' }),
        makeAddress({ id: 2, street: 'Rua B', isPrimary: true }),
      ],
    });
    const { getAllByText, getByText } = render(<AlterarEnderecoForm />);

    const streets = getAllByText(/Rua [AB]/).map((n) => n.props.children);
    expect(String(streets[0])).toContain('Rua B');
    expect(getByText('Novo endereço')).toBeTruthy();
  });

  it('deve adicionar um endereço novo', async () => {
    mockAdd.mockResolvedValue(undefined);
    const { getByText, getAllByText, findByText, queryByText } = render(
      <AlterarEnderecoForm />,
    );

    fireEvent.press(getByText('Adicionar endereço'));
    expect(getByText('Novo endereço')).toBeTruthy();
    fireEvent.press(getByText('Preencher endereço'));
    // O ultimo "Adicionar endereço" e o botao da janela.
    const buttons = getAllByText('Adicionar endereço');
    fireEvent.press(buttons[buttons.length - 1]);

    expect(await findByText('Endereço adicionado.')).toBeTruthy();
    expect(mockAdd).toHaveBeenCalledWith({
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Ap 1',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      postal_code: '01310100',
      user_id: 31,
      lat: 0,
      lng: 0,
      country_iso: 'BR',
      active: true,
    });
    expect(queryByText('Preencher endereço')).toBeNull();
  });

  it('deve mostrar o erro da janela quando salvar falha', async () => {
    mockAdd.mockRejectedValue(new Error('CEP inválido'));
    const { getByText, getAllByText, findByText } = render(
      <AlterarEnderecoForm />,
    );

    fireEvent.press(getByText('Adicionar endereço'));
    fireEvent.press(getByText('Preencher endereço'));
    const buttons = getAllByText('Adicionar endereço');
    fireEvent.press(buttons[buttons.length - 1]);

    expect(await findByText('CEP inválido')).toBeTruthy();
    expect(getByText('Preencher endereço')).toBeTruthy();
  });

  it('deve fechar a janela pelo botão Fechar e por Cancelar', () => {
    useAddressStore.setState({ addresses: [makeAddress()] });
    const { getByText, getByLabelText, queryByText } = render(
      <AlterarEnderecoForm />,
    );

    fireEvent.press(getByText('Novo endereço'));
    expect(getByText('Preencher endereço')).toBeTruthy();
    fireEvent.press(getByLabelText('Fechar'));
    expect(queryByText('Preencher endereço')).toBeNull();

    fireEvent.press(getByText('Novo endereço'));
    fireEvent.press(getByText('Cancelar'));
    expect(queryByText('Preencher endereço')).toBeNull();
  });

  it('deve editar um endereço sem mexer nas coordenadas', async () => {
    mockUpdate.mockResolvedValue(undefined);
    useAddressStore.setState({ addresses: [makeAddress({ id: 7 })] });
    const { getByText, findByText } = render(<AlterarEnderecoForm />);

    fireEvent.press(getByText('Editar'));
    expect(getByText('Editar endereço')).toBeTruthy();
    fireEvent.press(getByText('Preencher endereço'));
    fireEvent.press(getByText('Salvar alterações'));

    expect(await findByText('Endereço atualizado.')).toBeTruthy();
    expect(mockUpdate).toHaveBeenCalledWith(7, {
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Ap 1',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      postal_code: '01310100',
    });
  });

  it('deve salvar a edição com os dados já existentes', async () => {
    mockUpdate.mockResolvedValue(undefined);
    useAddressStore.setState({
      addresses: [
        makeAddress({
          id: 8,
          postal_code: '',
          street: '',
          number: '',
          neighborhood: '',
          city: '',
          state: '',
        }),
      ],
    });
    const { getByText, findByText } = render(<AlterarEnderecoForm />);

    fireEvent.press(getByText('Editar'));
    fireEvent.press(getByText('Salvar alterações'));

    expect(await findByText('Endereço atualizado.')).toBeTruthy();
    expect(mockUpdate).toHaveBeenCalledWith(8, {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      postal_code: '',
    });
  });

  it('deve excluir um endereço depois de confirmar', async () => {
    mockConfirm.mockResolvedValue(true);
    mockDelete.mockResolvedValue(undefined);
    useAddressStore.setState({ addresses: [makeAddress({ id: 3 })] });
    const { getByLabelText, findByText } = render(<AlterarEnderecoForm />);

    fireEvent.press(getByLabelText('Excluir Rua das Flores, 10'));

    expect(await findByText('Endereço excluído.')).toBeTruthy();
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Rua das Flores, 10 vai ser removido.',
      }),
    );
    expect(mockDelete).toHaveBeenCalledWith(3);
  });

  it('não deve excluir sem confirmação', async () => {
    mockConfirm.mockResolvedValue(false);
    useAddressStore.setState({ addresses: [makeAddress()] });
    const { getByLabelText } = render(<AlterarEnderecoForm />);

    fireEvent.press(getByLabelText('Excluir Rua das Flores, 10'));

    await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('deve mostrar o erro ao excluir', async () => {
    mockConfirm.mockResolvedValue(true);
    mockDelete.mockRejectedValue(new Error('Endereço em uso'));
    useAddressStore.setState({ addresses: [makeAddress()] });
    const { getByLabelText, findByText } = render(<AlterarEnderecoForm />);

    fireEvent.press(getByLabelText('Excluir Rua das Flores, 10'));

    expect(await findByText('Endereço em uso')).toBeTruthy();
  });

  it('deve tornar um endereço principal', async () => {
    mockSetPrimary.mockResolvedValue(undefined);
    useAddressStore.setState({ addresses: [makeAddress({ id: 5 })] });
    const { getByText, findByText } = render(<AlterarEnderecoForm />);

    fireEvent.press(getByText('Tornar principal'));

    expect(await findByText('Endereço principal alterado.')).toBeTruthy();
    expect(mockSetPrimary).toHaveBeenCalledWith(5);
  });

  it('deve mostrar o erro ao tornar principal', async () => {
    mockSetPrimary.mockRejectedValue(new Error('Sem permissão'));
    useAddressStore.setState({ addresses: [makeAddress()] });
    const { getByText, findByText } = render(<AlterarEnderecoForm />);

    fireEvent.press(getByText('Tornar principal'));

    expect(await findByText('Sem permissão')).toBeTruthy();
  });
});
