import { AxiosError, type AxiosResponse } from 'axios';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { uploadToStorage } from '@lib/uploadFile';
import { useChatBotStore } from '@stores/ChatBot';
import { Address, User } from '../types';
import { useUserStore } from '../User';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  registerTokenProvider: jest.fn(),
}));

jest.mock('@lib/uploadFile', () => ({
  uploadToStorage: jest.fn(),
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;
const upload = uploadToStorage as jest.MockedFunction<typeof uploadToStorage>;

const user: User = {
  id: 1,
  client_id: 2,
  name: 'Ana',
  email: 'a@x.com',
  phone: '11999999999',
  cpf: '12345678900',
  avatar_uri: 'https://img/ana.png',
};

const address: Address = {
  id: 3,
  lat: '-23.5',
  lng: '-46.6',
  street: 'Rua A',
  number: '10',
  complement: null,
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  country_iso: 'BR',
  postal_code: '01000000',
};

function httpError(status: number, data: Record<string, unknown> = {}) {
  return new AxiosError('fail', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: {} },
  } as AxiosResponse);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  useUserStore.setState({
    user: null,
    address: null,
    token: null,
    verificationEmail: null,
    lastCodeSentAt: null,
    avatarBase64: null,
  });
  useChatBotStore.getState().clearSession();
});

describe('UserStore - sessao', () => {
  it('abre a sessao quando o login nao pede segundo fator', async () => {
    http.post.mockResolvedValue({
      data: {
        token: '  tok  ',
        user: { ...user, address },
      },
    });

    await expect(
      useUserStore.getState().signInPassword('a@x.com', 'secreta'),
    ).resolves.toBeNull();

    expect(http.post).toHaveBeenCalledWith('/api/user/login', {
      email: 'a@x.com',
      password: 'secreta',
    });
    expect(useUserStore.getState().token).toBe('tok');
    expect(useUserStore.getState().user).toMatchObject({ id: 1, name: 'Ana' });
    expect(useUserStore.getState().address).toMatchObject({
      city: 'São Paulo',
    });
    expect(useUserStore.getState().avatarBase64).toBe('https://img/ana.png');
  });

  it('traduz credencial recusada e erro do servidor', async () => {
    http.post.mockRejectedValueOnce(httpError(401));
    await expect(
      useUserStore.getState().signInPassword('a@x.com', 'errada'),
    ).rejects.toThrow('Credenciais inválidas. Verifique seu e-mail e senha.');
    expect(useUserStore.getState().token).toBeNull();

    http.post.mockRejectedValueOnce(httpError(500));
    await expect(
      useUserStore.getState().signInPassword('a@x.com', 'secreta'),
    ).rejects.toThrow('Erro interno do servidor. Tente novamente mais tarde.');

    http.post.mockRejectedValueOnce(
      httpError(429, { error: 'Muitas tentativas.' }),
    );
    await expect(
      useUserStore.getState().signInPassword('a@x.com', 'secreta'),
    ).rejects.toThrow('Muitas tentativas.');
  });

  it('grava e-mail de verificacao, o instante do codigo e o reenvio', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    useUserStore.getState().setVerificationEmail('a@x.com');
    useUserStore.getState().recordCodeSent();
    http.post.mockResolvedValue({ data: {} });

    await useUserStore.getState().resendCode('a@x.com');

    expect(useUserStore.getState().verificationEmail).toBe('a@x.com');
    expect(useUserStore.getState().lastCodeSentAt).toBe(1700000000000);
    expect(http.post).toHaveBeenCalledWith('/auth/resend', {
      email: 'a@x.com',
    });
  });

  it('sai da conta e encerra o chatbot', () => {
    useUserStore.setState({
      user,
      address,
      token: 'tok',
      avatarBase64: 'img',
      verificationEmail: 'a@x.com',
      lastCodeSentAt: 10,
    });
    useChatBotStore.setState({
      sessionId: 8,
      messages: [
        {
          id: '1',
          role: 'user',
          text: 'oi',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    useUserStore.getState().signOut();

    expect(useUserStore.getState()).toMatchObject({
      user: null,
      address: null,
      token: null,
      avatarBase64: null,
      verificationEmail: null,
      lastCodeSentAt: null,
    });
    expect(useChatBotStore.getState().sessionId).toBeNull();
    expect(useChatBotStore.getState().messages).toEqual([]);
  });
});

describe('UserStore - perfil', () => {
  it('monta o usuario atual a partir do payload aninhado', async () => {
    useUserStore.setState({ user: { ...user, name: 'Antiga' } });
    http.get.mockResolvedValue({
      data: {
        user: {
          id: 1,
          name: 'Ana',
          email: 'a@x.com',
          phone: '11999999999',
          avatar_uri: 'https://img/nova.png',
          Client: { id: 8, cpf: '999' },
          Professional: { id: 4 },
          mfa_enabled: 1,
          admin: 1,
          professional: { verified: true },
        },
      },
    });

    await useUserStore.getState().fetchCurrentUser();

    expect(useUserStore.getState().user).toMatchObject({
      id: 1,
      client_id: 8,
      cpf: '999',
      professional_id: 4,
      mfa_enabled: true,
      admin: true,
      professional_verified: true,
      avatar_uri: 'https://img/nova.png',
    });
    expect(useUserStore.getState().avatarBase64).toBe('https://img/nova.png');
  });

  it('mantem o usuario anterior quando a leitura falha', async () => {
    useUserStore.setState({ user });
    http.get.mockRejectedValue(new Error('offline'));
    await useUserStore.getState().fetchCurrentUser();
    expect(useUserStore.getState().user).toEqual(user);
  });

  it('atualiza nome, e-mail e telefone', async () => {
    useUserStore.setState({ user });
    http.put.mockResolvedValue({ status: 200 });

    await useUserStore.getState().updateUserProfile({
      name: 'Ana Souza',
      email: 'ana@x.com',
      phone: '11888888888',
    });

    expect(http.put).toHaveBeenCalledWith('/api/user/me', {
      name: 'Ana Souza',
      email: 'ana@x.com',
      phone: '11888888888',
    });
    expect(useUserStore.getState().user).toMatchObject({
      name: 'Ana Souza',
      email: 'ana@x.com',
      phone: '11888888888',
    });
  });

  it('repassa a mensagem do servidor quando o perfil e recusado', async () => {
    useUserStore.setState({ user });
    http.put.mockRejectedValue(httpError(400, { error: 'E-mail em uso.' }));
    await expect(
      useUserStore.getState().updateUserProfile({
        name: 'Ana',
        email: 'a@x.com',
        phone: '1',
      }),
    ).rejects.toThrow('E-mail em uso.');
  });

  it('troca a senha e traduz os status conhecidos', async () => {
    http.post.mockResolvedValueOnce({ status: 200 });
    await expect(
      useUserStore.getState().changePassword('atual', 'nova'),
    ).resolves.toBeUndefined();
    expect(http.post).toHaveBeenCalledWith('/api/user/change-password', {
      current_password: 'atual',
      new_password: 'nova',
    });

    http.post.mockRejectedValueOnce(httpError(401));
    await expect(
      useUserStore.getState().changePassword('atual', 'nova'),
    ).rejects.toThrow('Senha atual incorreta.');

    http.post.mockRejectedValueOnce(httpError(400));
    await expect(
      useUserStore.getState().changePassword('atual', 'curta'),
    ).rejects.toThrow(
      'Dados inválidos. Verifique os requisitos da nova senha.',
    );

    http.post.mockRejectedValueOnce(httpError(503));
    await expect(
      useUserStore.getState().changePassword('atual', 'nova'),
    ).rejects.toThrow('Erro interno do servidor. Tente novamente mais tarde.');

    http.post.mockRejectedValueOnce(new Error('x'));
    await expect(
      useUserStore.getState().changePassword('atual', 'nova'),
    ).rejects.toThrow('Erro ao alterar a senha. Tente novamente.');
  });
});

describe('UserStore - avatar e cadastro profissional', () => {
  it('envia o avatar e grava a url devolvida', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    useUserStore.setState({ user });
    global.fetch = jest.fn().mockResolvedValue({
      blob: async () => new Blob(['img'], { type: 'image/jpeg' }),
    }) as unknown as typeof fetch;
    http.post.mockResolvedValue({
      data: { uploadUrl: 'https://blob/up', fileUrl: 'https://blob/a.jpg' },
    });
    upload.mockResolvedValue('https://cdn/a.jpg');
    http.patch.mockResolvedValue({});

    await expect(
      useUserStore.getState().uploadAvatar('file:///ana.jpg'),
    ).resolves.toEqual({
      erro: false,
      mensagem: 'Avatar atualizado com sucesso!',
      avatar_uri: 'https://cdn/a.jpg',
    });

    expect(http.post).toHaveBeenCalledWith('/api/avatar/upload-url', {
      fileName: 'avatar_1700000000000.jpg',
      fileType: 'image/jpeg',
    });
    expect(upload).toHaveBeenCalledWith(
      { uploadUrl: 'https://blob/up', fileUrl: 'https://blob/a.jpg' },
      expect.any(Blob),
      'image/jpeg',
    );
    expect(http.patch).toHaveBeenCalledWith('/api/avatar/update-path', {
      avatar_uri: 'https://cdn/a.jpg',
    });
    expect(useUserStore.getState().user?.avatar_uri).toBe('https://cdn/a.jpg');
    expect(useUserStore.getState().avatarBase64).toBeNull();
  });

  it('devolve erro sem derrubar a sessao quando o envio falha', async () => {
    useUserStore.setState({ user });
    http.post.mockRejectedValue(httpError(500, { error: 'Sem espaço.' }));
    await expect(
      useUserStore.getState().uploadAvatar('file:///ana.jpg'),
    ).resolves.toEqual({ erro: true, mensagem: 'Sem espaço.' });
    expect(useUserStore.getState().user).toEqual(user);
  });

  it('remove o avatar e traduz a falha', async () => {
    useUserStore.setState({ user, avatarBase64: 'img' });
    http.delete.mockResolvedValueOnce({});
    await expect(useUserStore.getState().removeAvatar()).resolves.toEqual({
      erro: false,
      mensagem: 'Avatar removido com sucesso!',
    });
    expect(http.delete).toHaveBeenCalledWith('/api/user/avatar');
    expect(useUserStore.getState().user?.avatar_uri).toBeNull();
    expect(useUserStore.getState().avatarBase64).toBeNull();

    http.delete.mockRejectedValueOnce(httpError(400, { error: 'Não foi.' }));
    await expect(useUserStore.getState().removeAvatar()).resolves.toEqual({
      erro: true,
      mensagem: 'Não foi.',
    });
  });

  it('marca o usuario como profissional depois do cadastro', async () => {
    useUserStore.setState({ user });
    http.post.mockResolvedValue({
      status: 201,
      data: { professional: { id: 9 } },
    });

    await useUserStore.getState().becomeProfessional({
      cpf: '12345678900',
      description: 'Cortes',
    });

    expect(http.post).toHaveBeenCalledWith('/api/professionals', {
      cpf: '12345678900',
      description: 'Cortes',
    });
    expect(useUserStore.getState().user?.professional_id).toBe(9);
  });

  it('explica a recusa do cadastro profissional', async () => {
    useUserStore.setState({ user });
    http.post.mockRejectedValue(
      httpError(400, { error: 'CPF já cadastrado.' }),
    );
    await expect(
      useUserStore.getState().becomeProfessional({
        cpf: '12345678900',
        description: 'Cortes',
      }),
    ).rejects.toThrow('CPF já cadastrado.');
    expect(useUserStore.getState().user?.professional_id).toBeUndefined();
  });
});

describe('UserStore - consentimento de localizacao', () => {
  const consent = {
    accepted: true,
    accepted_at: '2026-07-05T12:00:00.000Z',
    revoked_at: null,
  };

  it('aplica o status lido no usuario logado', async () => {
    useUserStore.setState({ user });
    http.get.mockResolvedValue({ data: consent });

    await expect(useUserStore.getState().getLocationConsent()).resolves.toEqual(
      consent,
    );
    expect(useUserStore.getState().user).toMatchObject({
      location_consent_accepted: true,
      location_consent_at: consent.accepted_at,
      location_consent_revoked_at: null,
    });
  });

  it('aceita e revoga gravando o retorno do servidor', async () => {
    useUserStore.setState({ user });
    http.post.mockResolvedValueOnce({ data: { consent } });
    await useUserStore.getState().acceptLocationConsent();
    expect(http.post).toHaveBeenCalledWith('/api/user/location-consent');
    expect(useUserStore.getState().user?.location_consent_accepted).toBe(true);

    const revoked = { ...consent, accepted: false, revoked_at: '2026-07-06' };
    http.post.mockResolvedValueOnce({ data: { consent: revoked } });
    await useUserStore.getState().revokeLocationConsent();
    expect(http.post).toHaveBeenCalledWith('/api/user/revoke-location-consent');
    expect(useUserStore.getState().user).toMatchObject({
      location_consent_accepted: false,
      location_consent_revoked_at: '2026-07-06',
    });
  });

  it('explica a falha ao registrar o consentimento', async () => {
    http.post.mockRejectedValue(httpError(500, { error: 'Indisponível.' }));
    await expect(
      useUserStore.getState().acceptLocationConsent(),
    ).rejects.toThrow('Indisponível.');
  });
});
