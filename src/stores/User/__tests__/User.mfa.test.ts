import { backendHttpClient } from '@lib/helpers/httpClient';
import { useUserStore } from '../User';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
  registerTokenProvider: jest.fn(),
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;
const apiUser = { id: 1, client_id: 2, name: 'Ana', email: 'a@x.com' };

beforeEach(() => {
  jest.clearAllMocks();
  useUserStore.setState({ user: null, token: null, address: null });
});

describe('UserStore - login com verificacao em duas etapas', () => {
  it('com MFA ativo devolve o desafio e nao abre sessao', async () => {
    http.post.mockResolvedValue({
      data: { mfa_required: true, mfa_token: 'abc', email_hint: 'an*@x.com' },
    });

    const challenge = await useUserStore
      .getState()
      .signInPassword('a@x.com', '123456');

    expect(challenge).toEqual({ mfaToken: 'abc', emailHint: 'an*@x.com' });
    expect(useUserStore.getState().token).toBeNull();
  });

  it('a segunda etapa envia token + codigo e abre a sessao', async () => {
    http.post.mockResolvedValue({ data: { token: 't', user: apiUser } });

    await useUserStore.getState().completeMfaSignIn('abc', '123456');

    expect(http.post).toHaveBeenCalledWith('/auth/mfa/verify', {
      mfa_token: 'abc',
      code: '123456',
    });
    expect(useUserStore.getState().token).toBe('t');
    expect(useUserStore.getState().user).toMatchObject({ id: 1, name: 'Ana' });
  });

  it('codigo recusado vira erro legivel e nao abre sessao', async () => {
    http.post.mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { error: 'Código inválido.' } },
    });

    await expect(
      useUserStore.getState().completeMfaSignIn('abc', '000000'),
    ).rejects.toThrow();
    expect(useUserStore.getState().token).toBeNull();
  });

  it('reenvia o codigo para o mesmo desafio', async () => {
    http.post.mockResolvedValue({ data: {} });
    await useUserStore.getState().resendMfaCode('abc');
    expect(http.post).toHaveBeenCalledWith('/auth/mfa/resend', {
      mfa_token: 'abc',
    });
  });
});
