import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { AxiosError, AxiosResponse } from 'axios';
import LoginScreen from '../Login';
import { useUserStore } from '@stores/User';
import { User } from '@stores/User/types';
import { leaveAuthFlow } from '@lib/auth/leaveAuthFlow';
import { checkForNewNotifications } from '@utils/usePushNotifications';

const mockNavigate = jest.fn();
const mockReset = jest.fn();

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@lib/auth/leaveAuthFlow', () => ({ leaveAuthFlow: jest.fn() }));

jest.mock('@utils/usePushNotifications', () => ({
  checkForNewNotifications: jest.fn(() => Promise.resolve()),
}));

jest.mock('@components/ui/CodeEntry', () => {
  const { TextInput } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({
      value,
      onChange,
    }: {
      value: string;
      onChange: (code: string) => void;
    }) => (
      <TextInput
        accessibilityLabel="Código"
        value={value}
        onChangeText={onChange}
      />
    ),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    reset: mockReset,
    goBack: jest.fn(),
    canGoBack: () => true,
  }),
}));

const mockLeave = leaveAuthFlow as jest.MockedFunction<typeof leaveAuthFlow>;
const mockCheck = checkForNewNotifications as jest.MockedFunction<
  typeof checkForNewNotifications
>;

const challenge = { mfaToken: 'mfa-1', emailHint: 'a***@teste.com' };

const fillAndSubmit = (
  utils: ReturnType<typeof render>,
  email = 'ana@teste.com',
  password = 'segredo',
) => {
  fireEvent.changeText(utils.getByPlaceholderText('seu@email.com'), email);
  fireEvent.changeText(utils.getByPlaceholderText('Sua senha'), password);
  fireEvent.press(utils.getByRole('button', { name: 'Entrar' }));
};

describe('LoginScreen', () => {
  const signInPassword = jest.fn();
  const completeMfaSignIn = jest.fn();
  const resendMfaCode = jest.fn();

  const signedInAs = (user: Partial<User> | null) => () => {
    useUserStore.setState({ user: user as unknown as User });
    return Promise.resolve(null);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    signInPassword.mockImplementation(signedInAs({ id: 3 }));
    completeMfaSignIn.mockImplementation(() => {
      useUserStore.setState({
        user: { id: 3, professional_id: 8 } as unknown as User,
      });
      return Promise.resolve();
    });
    resendMfaCode.mockResolvedValue(undefined);
    useUserStore.setState({
      user: null,
      signInPassword,
      completeMfaSignIn,
      resendMfaCode,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('valida e-mail e senha antes de entrar', async () => {
    const utils = render(<LoginScreen />);

    fireEvent.press(utils.getByRole('button', { name: 'Entrar' }));
    expect(await utils.findByText('Informe seu e-mail.')).toBeTruthy();
    expect(utils.getByText('Informe sua senha.')).toBeTruthy();

    fireEvent.changeText(utils.getByPlaceholderText('seu@email.com'), 'x');
    fireEvent.press(utils.getByRole('button', { name: 'Entrar' }));
    expect(await utils.findByText('Digite um e-mail válido.')).toBeTruthy();
    expect(signInPassword).not.toHaveBeenCalled();
  });

  it('entra e sai do fluxo de login', async () => {
    jest.useFakeTimers();
    const utils = render(<LoginScreen />);
    fireEvent.changeText(
      utils.getByPlaceholderText('seu@email.com'),
      'ana@teste.com',
    );
    fireEvent.changeText(utils.getByPlaceholderText('Sua senha'), 'segredo');
    fireEvent(utils.getByPlaceholderText('Sua senha'), 'submitEditing');

    await waitFor(() => expect(mockLeave).toHaveBeenCalled());
    expect(signInPassword).toHaveBeenCalledWith('ana@teste.com', 'segredo');
    expect(mockLeave).toHaveBeenCalledWith(expect.anything(), false);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockCheck).toHaveBeenCalledWith('3', expect.any(Date), false);
  });

  it('leva o administrador direto ao painel', async () => {
    signInPassword.mockImplementation(signedInAs({ id: 1, admin: true }));
    const utils = render(<LoginScreen />);
    fillAndSubmit(utils);

    await waitFor(() =>
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'AdminDashboard' }],
      }),
    );
    expect(mockLeave).not.toHaveBeenCalled();
  });

  it('mostra o erro do login', async () => {
    signInPassword.mockRejectedValueOnce(new Error('Senha incorreta.'));
    const utils = render(<LoginScreen />);
    fillAndSubmit(utils);

    expect(await utils.findByText('Senha incorreta.')).toBeTruthy();
  });

  it('usa a mensagem padrão quando o erro não tem texto', async () => {
    signInPassword.mockRejectedValueOnce({});
    const utils = render(<LoginScreen />);
    fillAndSubmit(utils);

    expect(
      await utils.findByText(
        'Não foi possível entrar. Confira e-mail e senha.',
      ),
    ).toBeTruthy();
  });

  it('abre a recuperação de senha com o e-mail digitado', () => {
    const utils = render(<LoginScreen />);

    fireEvent.press(utils.getByText('Esqueci minha senha'));
    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword', {
      email: undefined,
    });

    fireEvent.changeText(
      utils.getByPlaceholderText('seu@email.com'),
      ' ana@teste.com ',
    );
    fireEvent.press(utils.getByText('Esqueci minha senha'));
    expect(mockNavigate).toHaveBeenLastCalledWith('ForgotPassword', {
      email: 'ana@teste.com',
    });
  });

  it('abre o cadastro', () => {
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText('Criar conta'));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('foca a senha ao confirmar o e-mail pelo teclado', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);

    expect(() =>
      fireEvent(getByPlaceholderText('seu@email.com'), 'submitEditing'),
    ).not.toThrow();
  });

  describe('verificação em duas etapas', () => {
    const openChallenge = async () => {
      signInPassword.mockResolvedValueOnce(challenge);
      const utils = render(<LoginScreen />);
      fillAndSubmit(utils);
      await utils.findByText('Confirme que é você');
      return utils;
    };

    it('confirma o código e entra', async () => {
      const utils = await openChallenge();
      expect(utils.getByText(/a\*\*\*@teste\.com/)).toBeTruthy();

      fireEvent.changeText(utils.getByLabelText('Código'), '123456');
      fireEvent.press(utils.getByText('Confirmar'));

      await waitFor(() =>
        expect(mockLeave).toHaveBeenCalledWith(expect.anything(), true),
      );
      expect(completeMfaSignIn).toHaveBeenCalledWith('mfa-1', '123456');
    });

    it('exige o código completo', async () => {
      const utils = await openChallenge();

      fireEvent.changeText(utils.getByLabelText('Código'), '12');
      fireEvent.press(utils.getByText('Confirmar'));
      expect(
        await utils.findByText('Digite os 6 números do código.'),
      ).toBeTruthy();
      expect(completeMfaSignIn).not.toHaveBeenCalled();
    });

    it('mostra o erro do código incorreto', async () => {
      completeMfaSignIn.mockRejectedValueOnce({});
      const utils = await openChallenge();

      fireEvent.changeText(utils.getByLabelText('Código'), '123456');
      fireEvent.press(utils.getByText('Confirmar'));
      expect(
        await utils.findByText('Código incorreto ou expirado.'),
      ).toBeTruthy();
    });

    it('reenvia o código', async () => {
      const utils = await openChallenge();

      fireEvent.changeText(utils.getByLabelText('Código'), '123');
      fireEvent.press(utils.getByText('Reenviar código'));
      expect(await utils.findByText('Enviamos um novo código.')).toBeTruthy();
      expect(resendMfaCode).toHaveBeenCalledWith('mfa-1');
      expect(utils.getByLabelText('Código').props.value).toBe('');
    });

    it('mostra o erro do servidor ao reenviar', async () => {
      const error = new AxiosError('falhou');
      error.response = {
        status: 410,
        data: { error: 'Login expirado.' },
      } as AxiosResponse;
      resendMfaCode.mockRejectedValueOnce(error);
      const utils = await openChallenge();

      fireEvent.press(utils.getByText('Reenviar código'));
      expect(await utils.findByText('Login expirado.')).toBeTruthy();
    });

    it('volta para o formulário de login', async () => {
      const utils = await openChallenge();

      fireEvent.press(utils.getByLabelText('Voltar'));
      expect(utils.getByText('Esqueci minha senha')).toBeTruthy();
    });
  });
});
