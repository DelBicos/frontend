import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import AddressSelectionModal from '../AddressSelectionModal';
import { Address, useAddressStore } from '@stores/Address';
import { useViaCepStore } from '@stores/ViaCep';

type SelectProps = { onChange: (value: string) => void };
const mockSelectProps: Record<string, SelectProps> = {};

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@lib/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock('@lib/hooks//useIBGE', () => ({
  useIBGE: () => ({
    states: [{ label: 'SP', value: 'SP' }],
    cities: [{ label: 'Sorocaba', value: 'Sorocaba' }],
    loadingCities: false,
  }),
}));

jest.mock('@components/ui/CustomSelect/CustomSelect', () => ({
  __esModule: true,
  default: (props: SelectProps) => {
    mockSelectProps.state = props;
    return null;
  },
}));

jest.mock('@components/ui/Autocomplete/Autocomplete', () => ({
  __esModule: true,
  default: (props: SelectProps) => {
    mockSelectProps.city = props;
    return null;
  },
}));

const buildAddress = (overrides: Partial<Address> = {}): Address => ({
  id: 1,
  lat: 0,
  lng: 0,
  street: 'Rua A',
  number: '10',
  complement: null,
  neighborhood: 'Centro',
  city: 'Sorocaba',
  state: 'SP',
  country_iso: 'BR',
  postal_code: '18000000',
  ...overrides,
});

const renderModal = (
  props: Partial<React.ComponentProps<typeof AddressSelectionModal>> = {},
) => {
  const handlers = { onClose: jest.fn(), onAddressSelect: jest.fn() };
  const utils = render(
    <AddressSelectionModal visible userId={7} {...handlers} {...props} />,
  );
  return { ...utils, ...handlers };
};

describe('AddressSelectionModal', () => {
  let fetchAddressesByUserId: jest.Mock;
  let addAddress: jest.Mock;

  beforeEach(() => {
    fetchAddressesByUserId = jest.fn(() => Promise.resolve());
    addAddress = jest.fn(() => Promise.resolve());
    useAddressStore.setState({
      addresses: [
        buildAddress(),
        buildAddress({ id: 2, street: 'Rua B', complement: 'Apto 3' }),
      ],
      isLoading: false,
      error: null,
      fetchAddressesByUserId,
      addAddress,
    });
    useViaCepStore.setState({
      loading: false,
      error: null,
      fetchCep: jest.fn(() => Promise.resolve(null)),
    });
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('deve buscar os endereços do usuário ao abrir e listá-los', () => {
    const { getByText, getAllByText } = renderModal();

    expect(fetchAddressesByUserId).toHaveBeenCalledWith(7);
    expect(getByText('Selecione o Endereço')).toBeTruthy();
    expect(getByText('Rua A, 10')).toBeTruthy();
    expect(getByText('Rua B, 10 - Apto 3')).toBeTruthy();
    expect(getAllByText('Centro - Sorocaba/SP')).toHaveLength(2);
  });

  it('não deve buscar endereços enquanto fechado', () => {
    renderModal({ visible: false });

    expect(fetchAddressesByUserId).not.toHaveBeenCalled();
  });

  it('deve mostrar o carregamento', () => {
    useAddressStore.setState({ isLoading: true });
    const { getByText } = renderModal();

    expect(getByText('Carregando endereços...')).toBeTruthy();
  });

  it('deve mostrar o erro da store', () => {
    useAddressStore.setState({ error: 'Erro ao carregar endereços' });
    const { getByText } = renderModal();

    expect(getByText('Erro ao carregar endereços')).toBeTruthy();
  });

  it('deve mostrar o estado vazio', () => {
    useAddressStore.setState({ addresses: [] });
    const { getByText } = renderModal();

    expect(getByText('Nenhum endereço cadastrado.')).toBeTruthy();
  });

  it('deve bloquear "Confirmar" sem endereço selecionado', () => {
    const { getByText, onAddressSelect } = renderModal();

    fireEvent.press(getByText('Confirmar'));

    expect(onAddressSelect).not.toHaveBeenCalled();
  });

  it('deve confirmar o endereço selecionado e fechar', () => {
    const { getByText, onAddressSelect, onClose } = renderModal();

    fireEvent.press(getByText('Rua B, 10 - Apto 3'));
    fireEvent.press(getByText('Confirmar'));

    expect(onAddressSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2 }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve usar o layout compacto em janelas pequenas', () => {
    const rn = jest.requireActual('react-native');
    jest
      .spyOn(rn, 'useWindowDimensions')
      .mockReturnValue({ width: 360, height: 600, scale: 1, fontScale: 1 });
    useAddressStore.setState({ addresses: [] });

    const { getByText } = renderModal();

    expect(getByText('Nenhum endereço cadastrado.')).toBeTruthy();
  });

  it('deve abrir o formulário de novo endereço e voltar para a lista', () => {
    const {
      getByText,
      getByPlaceholderText,
      queryByText,
      UNSAFE_getAllByType,
    } = renderModal();

    fireEvent.press(getByText('Adicionar novo endereço'));
    expect(getByText('Novo Endereço')).toBeTruthy();
    expect(getByPlaceholderText('00000-000')).toBeTruthy();
    expect(queryByText('Selecione o Endereço')).toBeNull();

    // O primeiro botão do modo de criação é a seta de voltar.
    fireEvent.press(UNSAFE_getAllByType(TouchableOpacity)[0]);
    expect(getByText('Selecione o Endereço')).toBeTruthy();
  });

  const fillForm = async (getByPlaceholderText: (text: string) => unknown) => {
    fireEvent.changeText(getByPlaceholderText('00000-000') as never, '1800');
    fireEvent.changeText(
      getByPlaceholderText('Ex: Rua das Flores') as never,
      'Rua Nova',
    );
    fireEvent.changeText(getByPlaceholderText('123') as never, '5');
    fireEvent.changeText(getByPlaceholderText('Ex: Centro') as never, 'Vila');
    await act(async () => {
      mockSelectProps.state.onChange('SP');
    });
    await act(async () => {
      mockSelectProps.city.onChange('Sorocaba');
    });
  };

  it('deve salvar o novo endereço e voltar para a lista', async () => {
    const { getByText, getByPlaceholderText, findByText } = renderModal();
    fireEvent.press(getByText('Adicionar novo endereço'));

    await fillForm(getByPlaceholderText);
    fireEvent.changeText(getByPlaceholderText('00000-000'), '18000-001');

    await act(async () => {
      fireEvent.press(getByText('Salvar Endereço'));
    });

    expect(addAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 7,
        street: 'Rua Nova',
        number: '5',
        neighborhood: 'Vila',
        city: 'Sorocaba',
        state: 'SP',
        postal_code: '18000001',
        country_iso: 'BR',
      }),
    );
    expect(fetchAddressesByUserId).toHaveBeenCalledTimes(2);
    expect(await findByText('Selecione o Endereço')).toBeTruthy();
  });

  it('deve avisar quando falha ao salvar o endereço', async () => {
    addAddress.mockRejectedValue(new Error('falhou'));
    const { getByText, getByPlaceholderText } = renderModal();
    fireEvent.press(getByText('Adicionar novo endereço'));

    await fillForm(getByPlaceholderText);
    fireEvent.changeText(getByPlaceholderText('00000-000'), '18000-001');

    await act(async () => {
      fireEvent.press(getByText('Salvar Endereço'));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Erro',
      'Falha ao salvar endereço.',
    );
    expect(getByText('Novo Endereço')).toBeTruthy();
  });

  it('não deve salvar um formulário inválido', async () => {
    const { getByText } = renderModal();
    fireEvent.press(getByText('Adicionar novo endereço'));

    await act(async () => {
      fireEvent.press(getByText('Salvar Endereço'));
    });

    expect(addAddress).not.toHaveBeenCalled();
  });
});
