import React from 'react';
import { ActivityIndicator } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { useForm, UseFormReturn } from 'react-hook-form';
import { AddressForm, AddressFormData } from '../AddressForm';
import { useViaCepStore } from '@stores/ViaCep';
import { ViaCepResponse } from '@stores/ViaCep/types';

type SelectProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  options?: unknown[];
  onChange: (value: string) => void;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
};

const mockSelectProps: Record<string, SelectProps> = {};
let mockIBGE = {
  states: [{ label: 'SP', value: 'SP' }],
  cities: [{ label: 'Sorocaba', value: 'Sorocaba' }],
  loadingCities: false,
};
const mockUseIBGE = jest.fn((_state: string) => mockIBGE);

jest.mock('@lib/hooks//useIBGE', () => ({
  useIBGE: (state: string) => mockUseIBGE(state),
}));

jest.mock('@components/ui/CustomSelect/CustomSelect', () => {
  const { Text } = jest.requireActual('react-native');
  const ReactActual = jest.requireActual('react');
  return {
    __esModule: true,
    default: (props: SelectProps) => {
      mockSelectProps.state = props;
      return ReactActual.createElement(
        Text,
        null,
        `select:${props.value ?? ''}:${props.error ?? ''}`,
      );
    },
  };
});

jest.mock('@components/ui/Autocomplete/Autocomplete', () => {
  const { Text } = jest.requireActual('react-native');
  const ReactActual = jest.requireActual('react');
  return {
    __esModule: true,
    default: (props: SelectProps) => {
      mockSelectProps.city = props;
      return ReactActual.createElement(
        Text,
        null,
        `city:${props.value ?? ''}:${props.error ?? ''}`,
      );
    },
  };
});

const viaCep = (overrides: Partial<ViaCepResponse> = {}): ViaCepResponse => ({
  cep: '18000-000',
  logradouro: 'Rua das Flores',
  complemento: '',
  bairro: 'Centro',
  localidade: 'Sorocaba',
  uf: 'SP',
  ...overrides,
});

let form: UseFormReturn<AddressFormData>;

function Harness({
  onSubmit,
  defaults,
}: {
  onSubmit?: () => void;
  defaults?: Partial<AddressFormData>;
}) {
  form = useForm<AddressFormData>({
    mode: 'onChange',
    defaultValues: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      ...defaults,
    },
  });
  return (
    <AddressForm
      control={form.control}
      errors={form.formState.errors}
      setValue={form.setValue}
      onSubmit={onSubmit}
    />
  );
}

describe('AddressForm', () => {
  let fetchCep: jest.Mock;

  beforeEach(() => {
    fetchCep = jest.fn(() => Promise.resolve(viaCep()));
    useViaCepStore.setState({ loading: false, error: null, fetchCep });
    mockIBGE = {
      states: [{ label: 'SP', value: 'SP' }],
      cities: [{ label: 'Sorocaba', value: 'Sorocaba' }],
      loadingCities: false,
    };
    mockUseIBGE.mockClear();
  });

  it('deve exibir os campos de endereço', () => {
    const { getByPlaceholderText } = render(<Harness />);

    expect(getByPlaceholderText('00000-000')).toBeTruthy();
    expect(getByPlaceholderText('Ex: Rua das Flores')).toBeTruthy();
    expect(getByPlaceholderText('123')).toBeTruthy();
    expect(getByPlaceholderText('Ex: Apto 101')).toBeTruthy();
    expect(getByPlaceholderText('Ex: Centro')).toBeTruthy();
    expect(mockSelectProps.city.placeholder).toBe('Selecione o estado');
    expect(mockSelectProps.city.disabled).toBe(true);
  });

  it('deve aplicar a máscara do CEP e preencher o endereço pelo ViaCEP', async () => {
    const { getByPlaceholderText } = render(<Harness />);

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('00000-000'), '18000000');
    });

    expect(fetchCep).toHaveBeenCalledWith('18000000');
    expect(form.getValues()).toEqual(
      expect.objectContaining({
        cep: '18000-000',
        street: 'Rua das Flores',
        neighborhood: 'Centro',
        city: 'Sorocaba',
        state: 'SP',
      }),
    );
    expect(mockUseIBGE).toHaveBeenLastCalledWith('SP');
    expect(mockSelectProps.city.placeholder).toBe('Digite para buscar...');
  });

  it('deve deixar rua e bairro vazios quando o ViaCEP não os informa', async () => {
    fetchCep.mockResolvedValue(viaCep({ logradouro: '', bairro: '' }));
    const { getByPlaceholderText } = render(
      <Harness defaults={{ street: 'antiga', neighborhood: 'antigo' }} />,
    );

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('00000-000'), '18000-000');
    });

    expect(form.getValues('street')).toBe('');
    expect(form.getValues('neighborhood')).toBe('');
  });

  it('não deve buscar o CEP incompleto ao digitar', async () => {
    const { getByPlaceholderText } = render(<Harness />);

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('00000-000'), '1800');
    });

    expect(fetchCep).not.toHaveBeenCalled();
    expect(form.getValues('cep')).toBe('1800');
  });

  it('deve buscar o CEP completo ao sair do campo', async () => {
    const { getByPlaceholderText } = render(
      <Harness defaults={{ cep: '18000-000' }} />,
    );

    await act(async () => {
      fireEvent(getByPlaceholderText('00000-000'), 'blur');
    });

    expect(fetchCep).toHaveBeenCalledWith('18000000');
  });

  it('não deve alterar o formulário quando o ViaCEP não encontra o CEP', async () => {
    fetchCep.mockResolvedValue(viaCep({ erro: true }));
    const { getByPlaceholderText } = render(<Harness />);

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('00000-000'), '99999999');
    });

    expect(form.getValues('street')).toBe('');
    expect(form.getValues('state')).toBe('');
  });

  it('deve mostrar carregamento e erro do CEP', () => {
    useViaCepStore.setState({ loading: true, error: 'CEP não encontrado' });
    const { getByText, UNSAFE_getByType } = render(<Harness />);

    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(getByText('CEP não encontrado')).toBeTruthy();
  });

  it('deve limpar a cidade ao trocar o estado', async () => {
    render(<Harness defaults={{ state: 'SP', city: 'Sorocaba' }} />);

    await act(async () => {
      mockSelectProps.state.onChange('RJ');
    });

    expect(form.getValues('state')).toBe('RJ');
    expect(form.getValues('city')).toBe('');
  });

  it('deve repassar a cidade escolhida e bloquear enquanto carrega cidades', async () => {
    mockIBGE = { ...mockIBGE, loadingCities: true };
    render(<Harness defaults={{ state: 'SP' }} />);

    expect(mockSelectProps.city.loading).toBe(true);
    expect(mockSelectProps.city.disabled).toBe(true);

    await act(async () => {
      mockSelectProps.city.onChange('Sorocaba');
    });
    expect(form.getValues('city')).toBe('Sorocaba');
  });

  it('deve indicar carregamento dos estados enquanto a lista está vazia', () => {
    mockIBGE = { ...mockIBGE, states: [] };
    render(<Harness />);

    expect(mockSelectProps.state.loading).toBe(true);
  });

  it('deve repassar o que o usuário digita nos campos de texto', () => {
    const { getByPlaceholderText } = render(<Harness />);

    fireEvent.changeText(getByPlaceholderText('Ex: Rua das Flores'), 'Rua A');
    fireEvent.changeText(getByPlaceholderText('123'), '42');
    fireEvent.changeText(getByPlaceholderText('Ex: Apto 101'), 'Casa 2');
    fireEvent.changeText(getByPlaceholderText('Ex: Centro'), 'Jardim');

    expect(form.getValues()).toEqual(
      expect.objectContaining({
        street: 'Rua A',
        number: '42',
        complement: 'Casa 2',
        neighborhood: 'Jardim',
      }),
    );
  });

  it('deve mostrar as mensagens de validação dos campos obrigatórios', async () => {
    const { findByText, getByText } = render(<Harness />);

    await act(async () => {
      await form.trigger();
    });

    expect(await findByText('CEP é obrigatório')).toBeTruthy();
    expect(getByText('Rua é obrigatória')).toBeTruthy();
    expect(getByText('Nº obrigatório')).toBeTruthy();
    expect(getByText('Bairro é obrigatório')).toBeTruthy();
    expect(getByText('select::UF obrigatória')).toBeTruthy();
    expect(getByText('city::Cidade obrigatória')).toBeTruthy();
  });

  it('deve recusar CEP fora do formato', async () => {
    const { findByText } = render(<Harness defaults={{ cep: '123' }} />);

    await act(async () => {
      await form.trigger('cep');
    });

    expect(await findByText('CEP inválido')).toBeTruthy();
  });

  it('deve renderizar com o rodapé quando há onSubmit', () => {
    const { getByPlaceholderText } = render(<Harness onSubmit={jest.fn()} />);

    expect(getByPlaceholderText('00000-000')).toBeTruthy();
  });
});
