import { AxiosError, AxiosHeaders } from 'axios';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { addressErrorMessage, useAddressStore } from '../Address';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;

const httpError = (status: number, data: unknown = {}) => {
  const error = new AxiosError('falhou');
  error.response = {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
};

const address = (id: number, extra = {}) =>
  ({ id, street: `Rua ${id}`, city: 'Sorocaba', ...extra }) as any;

beforeEach(() => {
  jest.clearAllMocks();
  useAddressStore.setState({ addresses: [], isLoading: false, error: null });
});

describe('AddressStore', () => {
  it('carrega os enderecos da sessao autenticada', async () => {
    http.get.mockResolvedValue({ data: [address(1), address(2)] });

    await useAddressStore.getState().fetchAddressesByUserId(99);

    expect(http.get).toHaveBeenCalledWith('/api/address/session');
    expect(useAddressStore.getState().addresses).toHaveLength(2);
    expect(useAddressStore.getState().isLoading).toBe(false);
  });

  it('falha ao carregar limpa a lista e nao lanca', async () => {
    useAddressStore.setState({ addresses: [address(1)] });
    http.get.mockRejectedValue(httpError(500));

    await useAddressStore.getState().fetchAddressesByUserId(1);

    expect(useAddressStore.getState()).toMatchObject({
      addresses: [],
      error: 'Erro no servidor. Tente novamente mais tarde.',
    });
  });

  it('adiciona, atualiza e remove localmente apos sucesso', async () => {
    http.post.mockResolvedValue({ data: address(3) });
    http.put.mockResolvedValue({ data: {} });
    http.delete.mockResolvedValue({ data: {} });
    const store = useAddressStore.getState();

    await store.addAddress({ street: 'Rua 3' } as any);
    await store.updateAddress(3, { number: '10' });
    expect(useAddressStore.getState().addresses[0]).toMatchObject({
      id: 3,
      number: '10',
    });

    await store.deleteAddress(3);
    expect(useAddressStore.getState().addresses).toEqual([]);
  });

  it('marca apenas um endereco como principal', async () => {
    useAddressStore.setState({ addresses: [address(1), address(2)] });
    http.put.mockResolvedValue({ data: {} });

    await useAddressStore.getState().setPrimaryAddress(2);

    expect(http.put).toHaveBeenCalledWith('/api/address/session/2', {
      isPrimary: true,
    });
    expect(
      useAddressStore.getState().addresses.map((a) => a.isPrimary),
    ).toEqual([false, true]);
  });

  it('propaga erro com mensagem amigavel nas escritas', async () => {
    http.post.mockRejectedValue(httpError(400, { error: 'CEP inválido' }));
    await expect(
      useAddressStore.getState().addAddress({} as any),
    ).rejects.toThrow('CEP inválido');
    expect(useAddressStore.getState().error).toBe('CEP inválido');
  });
});

describe('addressErrorMessage', () => {
  it.each([
    ['fetch', 401, 'Não autorizado. Faça login novamente.'],
    ['delete', 403, 'Você não tem permissão para deletar este endereço.'],
    ['update', 403, 'Você não tem permissão para editar este endereço.'],
    ['fetch', 404, 'Endereços não encontrados'],
    ['update', 404, 'Endereço não encontrado'],
    ['add', 422, 'Dados inválidos. Verifique as informações.'],
    ['primary', 500, 'Erro ao definir endereço principal'],
  ] as const)('%s + %i', (operation, status, expected) => {
    expect(addressErrorMessage(operation, httpError(status))).toBe(expected);
  });

  it('usa fallback para erros sem resposta', () => {
    expect(addressErrorMessage('delete', new Error('rede'))).toBe(
      'Erro ao deletar endereço',
    );
  });
});
