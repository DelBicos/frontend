import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ForgotPasswordScreen from '../ForgotPassword';
import { useUserStore } from '@stores/User';
import { User } from '@stores/User/types';
import { requestPasswordReset, resetPassword } from '@api/auth';
import { leaveAuthFlow } from '@lib/auth/leaveAuthFlow';

const mockNavigate = jest.fn();
let mockParams: Record<string, unknown> | undefined;

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@api/auth', () => ({
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
}));

jest.mock('@lib/auth/leaveAuthFlow', () => ({ leaveAuthFlow: jest.fn() }));

// Campo do codigo simplificado: um unico campo preenche os 6 digitos.
jest.mock('@components/ui/CodeInput', () => {
  const { TextInput } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({
      setVerificationCode,
    }: {
      setVerificationCode: (code: string[]) => void;
    }) => (
      <TextInput
        accessibilityLabel="Código"
        onChangeText={(text: string) =>
          setVerificationCode(
            text.split('').concat(Array(6).fill('')).slice(0, 6),
          )
        }
      />
    ),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
    canGoBack: () => true,
  }),
  useRoute: () => ({ params: mockParams }),
}));

const mockRequest = requestPasswordReset as jest.MockedFunction<
  typeof requestPasswordReset
>;
const mockReset = resetPassword as jest.MockedFunction<typeof resetPassword>;
const mockLeave = leaveAuthFlow as jest.MockedFunction<typeof leaveAuthFlow>;

const goToCodeStep = async (utils: ReturnType<typeof render>) => {
  fireEvent.changeText(
    utils.getByPlaceholderText('seu@email.com'),
    ' Ana@Teste.com ',
  );
  fireEvent.press(utils.getByText('Enviar código'));
  await utils.findByText('Crie uma nova senha');
};

const fillPasswords = (
  utils: ReturnType<typeof render>,
  password: string,
  confirm: string,
) => {
  fireEvent.changeText(
    utils.getByPlaceholderText('Mínimo de 6 caracteres'),
    password,
  );
  fireEvent.changeText(
    utils.getAllByLabelText('Repita a nova senha').slice(-1)[0],
    confirm,
  );
};

describe('ForgotPasswordScreen', () => {
  const signInPassword = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = undefined;
    mockRequest.mockResolvedValue('ok');
    mockReset.mockResolvedValue(undefined);
    signInPassword.mockImplementation(() => {
      useUserStore.setState({
        user: { id: 1, professional_id: 9 } as unknown as User,
      });
      return Promise.resolve();
    });
    useUserStore.setState({ user: null, signInPassword });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('valida o e-mail antes de enviar o código', () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <ForgotPasswordScreen />,
    );

    fireEvent.press(getByText('Enviar código'));
    expect(getByText('Digite um e-mail válido.')).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'a');
    expect(queryByText('Digite um e-mail válido.')).toBeNull();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('preenche o e-mail vindo da rota e envia pelo teclado', async () => {
    mockParams = { email: 'rota@teste.com' };
    const { getByDisplayValue, findByText } = render(<ForgotPasswordScreen />);

    fireEvent(getByDisplayValue('rota@teste.com'), 'submitEditing');
    expect(await findByText('Crie uma nova senha')).toBeTruthy();
    expect(mockRequest).toHaveBeenCalledWith('rota@teste.com');
  });

  it('mostra o erro ao enviar o código', async () => {
    mockRequest.mockRejectedValueOnce(new Error('x'));
    const { getByText, getByPlaceholderText, findByText } = render(
      <ForgotPasswordScreen />,
    );

    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'a@b.com');
    fireEvent.press(getByText('Enviar código'));
    expect(await findByText('Não foi possível enviar o código.')).toBeTruthy();
  });

  it('volta ao login pelo link', () => {
    const { getByText } = render(<ForgotPasswordScreen />);

    fireEvent.press(getByText('Entrar'));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('troca a senha e entra na conta', async () => {
    const utils = render(<ForgotPasswordScreen />);
    await goToCodeStep(utils);
    expect(mockRequest).toHaveBeenCalledWith('ana@teste.com');
    expect(utils.getByText('ana@teste.com')).toBeTruthy();

    fireEvent.changeText(utils.getByLabelText('Código'), '123456');
    fillPasswords(utils, 'nova123', 'nova123');
    fireEvent.press(utils.getByText('Salvar e entrar'));

    await waitFor(() => expect(mockLeave).toHaveBeenCalled());
    expect(mockReset).toHaveBeenCalledWith(
      'ana@teste.com',
      '123456',
      'nova123',
    );
    expect(signInPassword).toHaveBeenCalledWith('ana@teste.com', 'nova123');
    expect(mockLeave).toHaveBeenCalledWith(expect.anything(), true);
  });

  it('exige o código completo', async () => {
    const utils = render(<ForgotPasswordScreen />);
    await goToCodeStep(utils);

    fireEvent.changeText(utils.getByLabelText('Código'), '123');
    fillPasswords(utils, 'nova123', 'nova123');
    fireEvent.press(utils.getByText('Salvar e entrar'));

    expect(
      await utils.findByText('Digite os 6 números do código.'),
    ).toBeTruthy();
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('valida a nova senha e a confirmação', async () => {
    const utils = render(<ForgotPasswordScreen />);
    await goToCodeStep(utils);

    fireEvent.press(utils.getByText('Salvar e entrar'));
    expect(await utils.findByText('Crie uma nova senha.')).toBeTruthy();
    expect(utils.getByText('Repita a nova senha.')).toBeTruthy();

    fillPasswords(utils, '123', '456');
    fireEvent.press(utils.getByText('Salvar e entrar'));
    expect(await utils.findByText('Use pelo menos 6 caracteres.')).toBeTruthy();
    expect(utils.getByText('As senhas não são iguais.')).toBeTruthy();
  });

  it('mostra o erro quando o servidor recusa o código', async () => {
    mockReset.mockRejectedValueOnce(new Error('x'));
    const utils = render(<ForgotPasswordScreen />);
    await goToCodeStep(utils);

    fireEvent.changeText(utils.getByLabelText('Código'), '123456');
    fillPasswords(utils, 'nova123', 'nova123');
    fireEvent(
      utils.getAllByLabelText('Repita a nova senha').slice(-1)[0],
      'submitEditing',
    );

    expect(
      await utils.findByText('Não foi possível trocar a senha.'),
    ).toBeTruthy();
    expect(signInPassword).not.toHaveBeenCalled();
  });

  it('vai para o login quando não consegue entrar depois de trocar', async () => {
    signInPassword.mockRejectedValueOnce(new Error('x'));
    const utils = render(<ForgotPasswordScreen />);
    await goToCodeStep(utils);

    fireEvent.changeText(utils.getByLabelText('Código'), '123456');
    fillPasswords(utils, 'nova123', 'nova123');
    fireEvent.press(utils.getByText('Salvar e entrar'));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('Login'));
  });

  it('reenvia o código depois da espera', async () => {
    jest.useFakeTimers();
    const utils = render(<ForgotPasswordScreen />);
    await goToCodeStep(utils);

    expect(utils.getByText('Reenviar código em 60s')).toBeTruthy();
    fireEvent.press(utils.getByText('Reenviar código em 60s'));
    expect(mockRequest).toHaveBeenCalledTimes(1);

    for (let i = 0; i < 60; i += 1) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    fireEvent.press(utils.getByText('Reenviar código'));
    expect(await utils.findByText('Enviamos um novo código.')).toBeTruthy();
    expect(mockRequest).toHaveBeenCalledTimes(2);

    for (let i = 0; i < 60; i += 1) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    mockRequest.mockRejectedValueOnce(new Error('x'));
    fireEvent.press(utils.getByText('Reenviar código'));
    expect(
      await utils.findByText('Não foi possível reenviar o código.'),
    ).toBeTruthy();
  });

  it('volta para a etapa do e-mail', async () => {
    const utils = render(<ForgotPasswordScreen />);
    await goToCodeStep(utils);

    fireEvent.press(utils.getByLabelText('Voltar'));
    expect(utils.getByText('Esqueceu a senha?')).toBeTruthy();
  });
});
