import { AxiosError, AxiosHeaders } from 'axios';

import { backendHttpClient } from '@lib/helpers/httpClient';
import {
  mapAuthResponse,
  login,
  register,
  requestPasswordReset,
  resendCode,
  resetPassword,
  verifyCode,
} from '../auth';
import { getActiveSession, sendMessage } from '../chatbot';
import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiErrorStatus,
} from '../errors';
import {
  confirmPayment,
  createPaymentIntent,
  paymentIntentIdFromSecret,
} from '../payments';

// jest.mock e içado pelo babel-jest para antes dos imports.
jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { post: jest.fn(), get: jest.fn() },
}));

const post = backendHttpClient.post as jest.Mock;
const get = backendHttpClient.get as jest.Mock;

const axiosError = (status?: number, data?: unknown) => {
  const error = new AxiosError('falhou');
  if (status) {
    error.response = {
      status,
      data,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
  }
  return error;
};

beforeEach(() => jest.clearAllMocks());

describe('errors', () => {
  it('usa a mensagem do backend ({ error } ou { message })', () => {
    expect(
      getApiErrorMessage(axiosError(400, { error: 'CPF inválido' }), 'x'),
    ).toBe('CPF inválido');
    expect(
      getApiErrorMessage(axiosError(400, { message: 'Legado' }), 'x'),
    ).toBe('Legado');
  });

  it('usa fallback sem mensagem e avisa sobre falta de conexao', () => {
    expect(getApiErrorMessage(axiosError(500, {}), 'Falhou')).toBe('Falhou');
    expect(getApiErrorMessage(axiosError(), 'Falhou')).toMatch(/conectar/);
    expect(getApiErrorMessage(new Error('qualquer'), 'Falhou')).toBe('Falhou');
  });

  it('expoe status e codigo do erro', () => {
    const error = axiosError(404, { code: 'SESSION_EXPIRED' });
    expect(getApiErrorStatus(error)).toBe(404);
    expect(getApiErrorCode(error)).toBe('SESSION_EXPIRED');
    expect(getApiErrorStatus(new Error('x'))).toBeUndefined();
  });
});

describe('auth', () => {
  const apiUser = {
    id: 1,
    client_id: 7,
    name: 'Ana',
    email: 'ana@x.com',
    phone: '1',
    cpf: '123',
    professional: { id: 20 },
    address: { id: 3, lat: '1', lng: '2', street: 'Rua', city: 'Sorocaba' },
  };

  it('mapeia token, usuario e endereco', () => {
    const session = mapAuthResponse({ token: ' abc ', user: apiUser });
    expect(session.token).toBe('abc');
    expect(session.user).toMatchObject({
      id: 1,
      client_id: 7,
      professional_id: 20,
    });
    expect(session.address).toMatchObject({
      id: 3,
      street: 'Rua',
      complement: null,
    });
  });

  it('rejeita resposta sem token', () => {
    expect(() => mapAuthResponse({ user: apiUser })).toThrow();
  });

  it('login e verificacao chamam as rotas corretas', async () => {
    post.mockResolvedValue({ data: { token: 't', user: apiUser } });
    const result = await login('ana@x.com', '123456');
    expect(result.mfaRequired).toBe(false);
    await verifyCode('ana@x.com', '654321');
    expect(post.mock.calls[0]).toEqual([
      '/api/user/login',
      { email: 'ana@x.com', password: '123456' },
    ]);
    expect(post.mock.calls[1]).toEqual([
      '/auth/verify',
      { email: 'ana@x.com', code: '654321' },
    ]);
  });
});

describe('auth - segunda etapa', () => {
  it('login com MFA devolve o desafio em vez da sessao', async () => {
    post.mockResolvedValue({
      data: { mfa_required: true, mfa_token: 'abc', email_hint: 'an*@x.com' },
    });
    expect(await login('ana@x.com', '123456')).toEqual({
      mfaRequired: true,
      mfaToken: 'abc',
      emailHint: 'an*@x.com',
    });
  });
});

describe('payments', () => {
  it('nao envia valor nem userId: o servidor calcula e usa o token', async () => {
    post.mockResolvedValue({ data: { clientSecret: 'pi_1_secret_2' } });
    const input = {
      professionalId: 20,
      serviceId: 40,
      selectedTime: '2030-01-10T13:00:00.000Z',
      addressId: 3,
    };

    await expect(createPaymentIntent(input)).resolves.toBe('pi_1_secret_2');
    const body = post.mock.calls[0][1];
    expect(body).toEqual(input);
    expect(body).not.toHaveProperty('amount');
  });

  it('falha com resposta sem client_secret', async () => {
    post.mockResolvedValue({ data: {} });
    await expect(
      createPaymentIntent({
        professionalId: 1,
        serviceId: 1,
        selectedTime: 'x',
        addressId: 1,
      }),
    ).rejects.toThrow();
  });

  it('confirma apenas com o id do pagamento', async () => {
    post.mockResolvedValue({ data: { appointment: { id: 5 } } });
    await confirmPayment('pi_1');
    expect(post).toHaveBeenCalledWith('/api/payments/confirm', {
      paymentIntentId: 'pi_1',
    });
  });

  it('extrai o id do PaymentIntent do client_secret', () => {
    expect(paymentIntentIdFromSecret('pi_123_secret_abc')).toBe('pi_123');
  });
});

describe('auth - cadastro e senha', () => {
  it('cadastra e reenvia o codigo nas rotas corretas', async () => {
    post.mockResolvedValue({ data: {} });
    const payload = {
      name: 'Ana',
      email: 'ana@exemplo.com',
      password: 'segredo-teste',
      cpf: '00000000000',
      address: { postal_code: '01001000', street: 'Rua A', number: '1' },
    };

    await register(payload);
    expect(post).toHaveBeenCalledWith('/auth/register', payload);

    await resendCode('ana@exemplo.com');
    expect(post).toHaveBeenLastCalledWith('/auth/resend', {
      email: 'ana@exemplo.com',
    });
  });

  it('pede a troca de senha e devolve a mensagem do servidor', async () => {
    post.mockResolvedValueOnce({ data: { message: 'Enviamos um codigo.' } });
    await expect(requestPasswordReset('ana@exemplo.com')).resolves.toBe(
      'Enviamos um codigo.',
    );
    expect(post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'ana@exemplo.com',
    });

    post.mockResolvedValueOnce({ data: undefined });
    await expect(requestPasswordReset('ana@exemplo.com')).resolves.toBe('');
  });

  it('grava a nova senha com o codigo', async () => {
    post.mockResolvedValue({ data: {} });
    await resetPassword('ana@exemplo.com', '123456', 'nova-senha-teste');
    expect(post).toHaveBeenCalledWith('/auth/reset-password', {
      email: 'ana@exemplo.com',
      code: '123456',
      password: 'nova-senha-teste',
    });
  });
});

describe('chatbot', () => {
  it('busca a sessao ativa do usuario', async () => {
    get.mockResolvedValueOnce({ data: { session_id: 4 } });
    await expect(getActiveSession()).resolves.toEqual({ session_id: 4 });
    expect(get).toHaveBeenCalledWith('/api/chat/bot/session/active');

    get.mockResolvedValueOnce({ data: null });
    await expect(getActiveSession()).resolves.toBeNull();
  });

  it('envia a mensagem com sessao e horario escolhido', async () => {
    post.mockResolvedValue({ data: { reply: 'ok' } });
    const signal = new AbortController().signal;

    await expect(
      sendMessage(
        {
          message: 'Quero agendar',
          sessionId: 9,
          channel: 'app',
          timezone: 'America/Sao_Paulo',
          utcOffsetMinutes: -180,
          selectedTime: '2026-02-01T13:00:00.000Z',
        },
        signal,
      ),
    ).resolves.toEqual({ reply: 'ok' });

    expect(post).toHaveBeenCalledWith(
      '/api/chat/bot/message',
      {
        message: 'Quero agendar',
        session_id: 9,
        channel: 'app',
        timezone: 'America/Sao_Paulo',
        utc_offset_minutes: -180,
        selected_time: '2026-02-01T13:00:00.000Z',
      },
      { signal },
    );
  });

  it('omite sessao e horario quando nao informados', async () => {
    post.mockResolvedValue({ data: {} });
    await sendMessage({
      message: 'Oi',
      sessionId: null,
      channel: 'web',
      timezone: 'UTC',
      utcOffsetMinutes: 0,
    });
    expect(post).toHaveBeenCalledWith(
      '/api/chat/bot/message',
      { message: 'Oi', channel: 'web', timezone: 'UTC', utc_offset_minutes: 0 },
      { signal: undefined },
    );
  });
});
