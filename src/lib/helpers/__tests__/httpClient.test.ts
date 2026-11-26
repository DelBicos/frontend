import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  backendHttpClient,
  registerTokenProvider,
  registerUnauthorizedHandler,
} from '../httpClient';

/** Adaptador falso: nenhuma requisicao sai para a rede. */
const okAdapter: AxiosAdapter = async (config) => ({
  data: { ok: true },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

const failingAdapter =
  (status: number, data: unknown): AxiosAdapter =>
  async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError('falhou', String(status), config, null, {
      data,
      status,
      statusText: 'erro',
      headers: {},
      config: { ...config, headers: new AxiosHeaders() },
    });
  };

describe('backendHttpClient', () => {
  const onUnauthorized = jest.fn();

  beforeEach(() => {
    onUnauthorized.mockClear();
    registerUnauthorizedHandler(onUnauthorized);
    registerTokenProvider(() => null);
  });

  it('envia o token Bearer quando ha um provedor com token', async () => {
    registerTokenProvider(() => 'abc123');
    const res = await backendHttpClient.get('/api/x', { adapter: okAdapter });
    expect(res.config.headers.Authorization).toBe('Bearer abc123');
  });

  it('nao envia Authorization quando o provedor nao tem token', async () => {
    const res = await backendHttpClient.get('/api/x', { adapter: okAdapter });
    expect(res.config.headers.Authorization).toBeUndefined();
    expect(res.data).toEqual({ ok: true });
  });

  it('chama o handler de sessao recusada em 401', async () => {
    await expect(
      backendHttpClient.get('/api/x', { adapter: failingAdapter(401, {}) }),
    ).rejects.toBeInstanceOf(AxiosError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it.each([
    [{ msg: 'Token inválido' }],
    [{ msg: 'Acesso negado. É obrgatório o envio de token JWT' }],
    [{ error: 'jwt expired' }],
  ])('chama o handler em 403 de token (%p)', async (data) => {
    await expect(
      backendHttpClient.get('/api/x', { adapter: failingAdapter(403, data) }),
    ).rejects.toBeInstanceOf(AxiosError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('nao derruba a sessao em 403 de permissao nem em outros erros', async () => {
    await expect(
      backendHttpClient.get('/api/x', {
        adapter: failingAdapter(403, { error: 'Sem permissão' }),
      }),
    ).rejects.toBeInstanceOf(AxiosError);
    await expect(
      backendHttpClient.get('/api/x', { adapter: failingAdapter(403, {}) }),
    ).rejects.toBeInstanceOf(AxiosError);
    await expect(
      backendHttpClient.get('/api/x', { adapter: failingAdapter(500, {}) }),
    ).rejects.toBeInstanceOf(AxiosError);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
