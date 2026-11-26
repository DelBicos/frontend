import { Alert, Platform } from 'react-native';
import { deleteAsync } from 'expo-file-system/legacy';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { downloadFile, shareContent } from '../shareHelperSimple';

jest.mock('expo-file-system/legacy', () => ({ deleteAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));
jest.mock('@lib/logger', () => ({ logger: { error: jest.fn() } }));

const previousOS = Platform.OS;
const setOS = (os: string) =>
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });

const g = global as unknown as { document?: unknown };
const originalDocument = g.document;

let alert: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  alert.mockRestore();
  setOS(previousOS);
  g.document = originalDocument;
});

describe('shareContent', () => {
  it('no app compartilha e apaga o arquivo temporario', async () => {
    setOS('ios');
    await expect(shareContent('file:///a.csv')).resolves.toBe(true);
    expect(isAvailableAsync).not.toHaveBeenCalled();
    expect(shareAsync).toHaveBeenCalledWith('file:///a.csv');
    expect(deleteAsync).toHaveBeenCalledWith('file:///a.csv');
  });

  it('no web avisa quando o navegador nao compartilha', async () => {
    setOS('web');
    (isAvailableAsync as jest.Mock).mockResolvedValue(false);
    await expect(shareContent('blob:a')).resolves.toBe(false);
    expect(alert).toHaveBeenCalledWith(
      'Compartilhamento não disponível',
      expect.any(String),
    );
    expect(shareAsync).not.toHaveBeenCalled();
  });

  it('no web compartilha quando disponivel', async () => {
    setOS('web');
    (isAvailableAsync as jest.Mock).mockResolvedValue(true);
    await expect(shareContent('blob:a')).resolves.toBe(true);
    expect(shareAsync).toHaveBeenCalledWith('blob:a');
  });

  it('avisa o erro quando o compartilhamento falha', async () => {
    setOS('android');
    (shareAsync as jest.Mock).mockRejectedValue(new Error('cancelado'));
    await expect(shareContent('file:///a.csv')).resolves.toBe(false);
    expect(alert).toHaveBeenCalledWith(
      'Erro ao compartilhar',
      'Não foi possível compartilhar o arquivo.',
    );
  });
});

describe('downloadFile', () => {
  it('no web baixa pelo link temporario', async () => {
    setOS('web');
    const link = {
      href: '',
      download: '',
      target: '',
      click: jest.fn(),
    };
    const body = { appendChild: jest.fn(), removeChild: jest.fn() };
    g.document = { createElement: jest.fn(() => link), body };

    await expect(downloadFile('blob:a', 'dados.csv')).resolves.toBe(true);
    expect(link).toMatchObject({
      href: 'blob:a',
      download: 'dados.csv',
      target: '_blank',
    });
    expect(link.click).toHaveBeenCalled();
    expect(body.appendChild).toHaveBeenCalledWith(link);
    expect(body.removeChild).toHaveBeenCalledWith(link);
  });

  it('no app usa o compartilhamento para salvar', async () => {
    setOS('ios');
    (shareAsync as jest.Mock).mockResolvedValue(undefined);
    await expect(downloadFile('file:///a.csv', 'a.csv')).resolves.toBe(true);
    expect(shareAsync).toHaveBeenCalledWith('file:///a.csv');
  });

  it('retorna false quando o download falha', async () => {
    setOS('ios');
    (shareAsync as jest.Mock).mockRejectedValue(new Error('falhou'));
    await expect(downloadFile('file:///a.csv', 'a.csv')).resolves.toBe(false);
  });
});
