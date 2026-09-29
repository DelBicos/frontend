import { uploadToStorage } from '../uploadFile';

const mockPut = jest.fn();
jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { put: (...args: unknown[]) => mockPut(...args) },
}));

const file = new Blob(['x'], { type: 'image/png' });
const fetchMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (global as any).fetch = fetchMock;
});

describe('uploadToStorage', () => {
  it('URL absoluta: PUT direto com os cabecalhos do backend e devolve a fileUrl', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 201 });
    const url = await uploadToStorage(
      {
        uploadUrl: 'https://conta.blob.core.windows.net/c/a.png?sig=1',
        fileUrl: 'https://conta.blob.core.windows.net/c/a.png',
        uploadHeaders: { 'x-ms-blob-type': 'BlockBlob' },
      },
      file,
      'image/png',
    );

    expect(url).toBe('https://conta.blob.core.windows.net/c/a.png');
    const [target, init] = fetchMock.mock.calls[0];
    expect(target).toContain('sig=1');
    expect(init.method).toBe('PUT');
    expect(init.headers).toEqual({
      'Content-Type': 'image/png',
      'x-ms-blob-type': 'BlockBlob',
    });
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('falha quando o armazenamento recusa o envio', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 });
    await expect(
      uploadToStorage(
        { uploadUrl: 'https://x/y', fileUrl: 'https://x/z' },
        file,
        'image/png',
      ),
    ).rejects.toThrow('HTTP 403');
  });

  it('caminho relativo: passa pelo backend e usa a fileUrl da resposta', async () => {
    mockPut.mockResolvedValue({ data: { fileUrl: 'https://i.ibb.co/a.png' } });
    const url = await uploadToStorage(
      { uploadUrl: '/api/proxy-upload/token', fileUrl: null },
      file,
      'image/jpeg',
    );
    expect(url).toBe('https://i.ibb.co/a.png');
    expect(mockPut).toHaveBeenCalledWith('/api/proxy-upload/token', file, {
      headers: { 'Content-Type': 'image/jpeg' },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('erro claro quando nao ha URL final', async () => {
    mockPut.mockResolvedValue({ data: {} });
    await expect(
      uploadToStorage(
        { uploadUrl: '/api/proxy-upload/t', fileUrl: null },
        file,
        'image/png',
      ),
    ).rejects.toThrow('URL da imagem');
    fetchMock.mockResolvedValue({ ok: true, status: 201 });
    await expect(
      uploadToStorage({ uploadUrl: 'https://x/y' }, file, 'image/png'),
    ).rejects.toThrow('URL da imagem');
  });
});
