import { backendHttpClient } from '@lib/helpers/httpClient';
import { useVerificationStore } from '../Verification';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('@lib/uploadFile', () => ({ uploadToStorage: jest.fn() }));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;

beforeEach(() => {
  jest.clearAllMocks();
  useVerificationStore.setState({ status: null, loading: false, error: null });
});

describe('VerificationStore', () => {
  it('carrega a situacao da conta', async () => {
    const status = {
      email_verified: true,
      mfa_enabled: false,
      is_professional: true,
      identity: null,
      verified: false,
      verified_at: null,
    };
    http.get.mockResolvedValue({ data: status });

    await useVerificationStore.getState().fetchStatus();

    expect(http.get).toHaveBeenCalledWith('/api/verification/status');
    expect(useVerificationStore.getState()).toMatchObject({
      status,
      loading: false,
      error: null,
    });
  });

  it('guarda a mensagem do servidor quando a consulta falha', async () => {
    http.get.mockRejectedValue(new Error('rede'));

    await useVerificationStore.getState().fetchStatus();

    expect(useVerificationStore.getState().error).toBeTruthy();
    expect(useVerificationStore.getState().loading).toBe(false);
  });

  it('ativa o MFA: pede o codigo e depois confirma', async () => {
    http.post.mockResolvedValueOnce({ data: { email_hint: 'an*@x.com' } });
    const hint = await useVerificationStore.getState().requestEnableMfa();
    expect(hint).toBe('an*@x.com');
    expect(http.post).toHaveBeenCalledWith('/api/verification/mfa/enable');

    http.post.mockResolvedValueOnce({ data: {} });
    await useVerificationStore.getState().confirmEnableMfa('123456');
    expect(http.post).toHaveBeenLastCalledWith(
      '/api/verification/mfa/confirm',
      {
        code: '123456',
      },
    );
  });

  it('desativar o MFA exige a senha', async () => {
    http.post.mockResolvedValue({ data: {} });
    await useVerificationStore.getState().disableMfa('segredo1');
    expect(http.post).toHaveBeenCalledWith('/api/verification/mfa/disable', {
      password: 'segredo1',
    });
  });

  it('envia o arquivo direto ao armazenamento privado e devolve a chave', async () => {
    const { uploadToStorage } = jest.requireMock('@lib/uploadFile');
    http.post.mockResolvedValue({
      data: {
        key: 'identity/20/front-a.jpg',
        uploadUrl: 'https://blob/up?sig=1',
        uploadHeaders: { 'x-ms-blob-type': 'BlockBlob' },
      },
    });
    const blob = new Blob(['x']);
    global.fetch = jest.fn().mockResolvedValue({ blob: async () => blob });

    const key = await useVerificationStore
      .getState()
      .uploadIdentityFile('front', 'file://foto.jpg');

    expect(key).toBe('identity/20/front-a.jpg');
    expect(http.post).toHaveBeenCalledWith(
      '/api/verification/identity/upload-url',
      { kind: 'front', fileType: 'image/jpeg' },
    );
    expect(uploadToStorage).toHaveBeenCalledWith(
      expect.objectContaining({ uploadUrl: 'https://blob/up?sig=1' }),
      blob,
      'image/jpeg',
    );
  });

  it('envia o pedido de identidade com as chaves', async () => {
    http.post.mockResolvedValue({ data: { id: 1, status: 'pending' } });
    const request = await useVerificationStore.getState().submitIdentity({
      document_type: 'cnh',
      front_key: 'k1',
      selfie_key: 'k2',
    });
    expect(request).toEqual({ id: 1, status: 'pending' });
    expect(http.post).toHaveBeenCalledWith('/api/verification/identity', {
      document_type: 'cnh',
      front_key: 'k1',
      selfie_key: 'k2',
    });
  });
});
