import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AxiosError, AxiosResponse } from 'axios';
import RegisterScreen from '../RegisterScreen';
import { useUserStore } from '@stores/User';
import { register } from '@api/auth';

const mockNavigate = jest.fn();

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@api/auth', () => ({ register: jest.fn() }));

// O formulario de endereco (CEP, IBGE) tem testes proprios; aqui so preenche.
jest.mock('@components/features/AddressForm/AddressForm', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    AddressForm: ({
      setValue,
    }: {
      setValue: (name: string, value: string) => void;
    }) => (
      <Text
        onPress={() => {
          setValue('cep', '18000000');
          setValue('street', 'Rua A');
          setValue('number', '10');
          setValue('neighborhood', 'Centro');
          setValue('city', 'Sorocaba');
          setValue('state', 'SP');
        }}>
        Preencher endereço
      </Text>
    ),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
    canGoBack: () => true,
  }),
}));

const mockRegister = register as jest.MockedFunction<typeof register>;

const fillForm = (
  utils: ReturnType<typeof render>,
  overrides: Partial<Record<string, string>> = {},
) => {
  const values = {
    name: ' Ana ',
    surname: ' Souza ',
    cpf: '529.982.247-25',
    phone: '(15) 99999-8888',
    email: 'Ana@Teste.com',
    password: 'segredo1',
    ...overrides,
  };
  fireEvent.changeText(utils.getByPlaceholderText('Seu nome'), values.name);
  fireEvent.changeText(
    utils.getByPlaceholderText('Seu sobrenome'),
    values.surname,
  );
  fireEvent.changeText(
    utils.getByPlaceholderText('000.000.000-00'),
    values.cpf,
  );
  fireEvent.changeText(
    utils.getByPlaceholderText('(00) 00000-0000'),
    values.phone,
  );
  fireEvent.changeText(
    utils.getByPlaceholderText('seu@email.com'),
    values.email,
  );
  fireEvent.changeText(
    utils.getByPlaceholderText('Mínimo de 6 caracteres'),
    values.password,
  );
  fireEvent.press(utils.getByText('Preencher endereço'));
};

describe('RegisterScreen', () => {
  const setVerificationEmail = jest.fn();
  const recordCodeSent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({ setVerificationEmail, recordCodeSent });
  });

  it('mostra os erros quando envia o formulário vazio', async () => {
    const { getByText, findByText, getByRole } = render(<RegisterScreen />);

    fireEvent.press(getByRole('button', { name: 'Criar conta' }));
    expect(await findByText('Informe seu nome.')).toBeTruthy();
    expect(getByText('Informe seu sobrenome.')).toBeTruthy();
    expect(getByText('Informe seu CPF.')).toBeTruthy();
    expect(getByText('Informe seu telefone.')).toBeTruthy();
    expect(getByText('Informe seu e-mail.')).toBeTruthy();
    expect(getByText('Crie uma senha.')).toBeTruthy();
    expect(
      getByText('Para criar a conta, aceite os termos de uso.'),
    ).toBeTruthy();
    expect(getByText('Confira os campos destacados acima.')).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('valida CPF, telefone, e-mail e senha', async () => {
    const utils = render(<RegisterScreen />);
    fillForm(utils, {
      cpf: '111.111.111-11',
      phone: '1599',
      email: 'email-invalido',
      password: '123',
    });

    fireEvent.press(utils.getByRole('button', { name: 'Criar conta' }));
    expect(await utils.findByText('CPF inválido.')).toBeTruthy();
    expect(utils.getByText('Telefone incompleto.')).toBeTruthy();
    expect(utils.getByText('Digite um e-mail válido.')).toBeTruthy();
    expect(utils.getByText('Use pelo menos 6 caracteres.')).toBeTruthy();
  });

  it('cria a conta e segue para a verificação do e-mail', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    const utils = render(<RegisterScreen />);
    fillForm(utils);

    fireEvent.press(utils.getByRole('checkbox'));
    fireEvent.press(utils.getByRole('button', { name: 'Criar conta' }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('VerificationScreen'),
    );
    expect(mockRegister).toHaveBeenCalledWith({
      name: 'Ana',
      surname: 'Souza',
      email: 'ana@teste.com',
      phone: '15999998888',
      password: 'segredo1',
      cpf: '52998224725',
      address: {
        postal_code: '18000000',
        street: 'Rua A',
        number: '10',
        complement: '',
        neighborhood: 'Centro',
        city: 'Sorocaba',
        state: 'SP',
        country_iso: 'BR',
      },
    });
    expect(setVerificationEmail).toHaveBeenCalledWith('ana@teste.com');
    expect(recordCodeSent).toHaveBeenCalled();
  });

  it('mostra a mensagem do servidor quando o cadastro falha', async () => {
    const error = new AxiosError('falhou');
    error.response = {
      status: 409,
      data: { error: 'E-mail já cadastrado.' },
    } as AxiosResponse;
    mockRegister.mockRejectedValueOnce(error);
    const utils = render(<RegisterScreen />);
    fillForm(utils);

    fireEvent.press(utils.getByRole('checkbox'));
    fireEvent.press(utils.getByRole('button', { name: 'Criar conta' }));

    expect(await utils.findByText('E-mail já cadastrado.')).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('usa a mensagem padrão para erros desconhecidos', async () => {
    mockRegister.mockRejectedValueOnce(new Error('x'));
    const utils = render(<RegisterScreen />);
    fillForm(utils);

    fireEvent.press(utils.getByRole('checkbox'));
    fireEvent.press(utils.getByRole('button', { name: 'Criar conta' }));

    expect(
      await utils.findByText('Não foi possível criar a conta agora.'),
    ).toBeTruthy();
  });

  it('abre os termos e a tela de login', () => {
    const { getByText } = render(<RegisterScreen />);

    fireEvent.press(getByText('termos de uso'));
    expect(mockNavigate).toHaveBeenCalledWith('Terms');

    fireEvent.press(getByText('Entrar'));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});
