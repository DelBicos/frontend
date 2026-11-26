import { ViaCepResponse } from '../types';
import { useViaCepStore } from '../index';

const fetchMock = jest.fn();

const address: ViaCepResponse = {
  cep: '01310-100',
  logradouro: 'Avenida Paulista',
  complemento: '',
  bairro: 'Bela Vista',
  localidade: 'São Paulo',
  uf: 'SP',
};

function reply(body: unknown, ok = true, status = 200, statusText = 'OK') {
  return {
    ok,
    status,
    statusText,
    json: async () => body,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = fetchMock as unknown as typeof fetch;
  useViaCepStore.setState({ loading: false, error: null });
});

describe('ViaCepStore', () => {
  it('rejeita CEP que nao tem 8 digitos e nao consulta a rede', async () => {
    await expect(useViaCepStore.getState().fetchCep('123')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(useViaCepStore.getState().error).toBe(
      'CEP inválido. Deve conter 8 dígitos.',
    );
  });

  it('consulta so os digitos e devolve o endereco', async () => {
    fetchMock.mockResolvedValue(reply(address));

    await expect(
      useViaCepStore.getState().fetchCep('01310-100'),
    ).resolves.toEqual(address);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/01310100/json/',
    );
    expect(useViaCepStore.getState()).toMatchObject({
      loading: false,
      error: null,
    });
  });

  it('registra o status quando a requisicao falha', async () => {
    fetchMock.mockResolvedValue(reply({}, false, 502, 'Bad Gateway'));
    await expect(
      useViaCepStore.getState().fetchCep('01310100'),
    ).resolves.toBeNull();
    expect(useViaCepStore.getState()).toMatchObject({
      loading: false,
      error: 'Erro na requisição: 502 Bad Gateway',
    });
  });

  it('traduz o CEP inexistente', async () => {
    fetchMock.mockResolvedValue(reply({ erro: true }));
    await expect(
      useViaCepStore.getState().fetchCep('00000000'),
    ).resolves.toBeNull();
    expect(useViaCepStore.getState().error).toBe('CEP não encontrado.');
    expect(useViaCepStore.getState().loading).toBe(false);
  });

  it('guarda a mensagem quando a rede cai', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    await expect(
      useViaCepStore.getState().fetchCep('01310100'),
    ).resolves.toBeNull();
    expect(useViaCepStore.getState().error).toBe('offline');
    expect(useViaCepStore.getState().loading).toBe(false);
  });
});
