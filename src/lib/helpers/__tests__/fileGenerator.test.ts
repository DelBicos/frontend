import { Platform } from 'react-native';
import { writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { printToFileAsync } from 'expo-print';
import * as XLSX from 'xlsx';
import {
  generateCSV,
  generateFileURI,
  generatePDF,
  generateXLSX,
} from '../fileGenerator';

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn(),
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
}));
jest.mock('expo-print', () => ({ printToFileAsync: jest.fn() }));
jest.mock('@lib/logger', () => ({ logger: { error: jest.fn() } }));

const previousOS = Platform.OS;
const setOS = (os: string) =>
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });

type UrlStatics = {
  createObjectURL?: (blob: Blob) => string;
  revokeObjectURL?: (url: string) => void;
};
const urlStatics = URL as unknown as UrlStatics;
const originalCreate = urlStatics.createObjectURL;
const originalRevoke = urlStatics.revokeObjectURL;
const g = global as unknown as { window?: unknown };
const originalWindow = g.window;

let createObjectURL: jest.Mock;
let revokeObjectURL: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  createObjectURL = jest.fn(() => 'blob:exemplo');
  revokeObjectURL = jest.fn();
  urlStatics.createObjectURL = createObjectURL;
  urlStatics.revokeObjectURL = revokeObjectURL;
});

afterEach(() => {
  setOS(previousOS);
  urlStatics.createObjectURL = originalCreate;
  urlStatics.revokeObjectURL = originalRevoke;
  g.window = originalWindow;
  jest.useRealTimers();
});

describe('generateFileURI', () => {
  it('no app grava o arquivo no cache e devolve o caminho', async () => {
    setOS('ios');
    await expect(generateFileURI('a,b', 'dados.csv', 'text/csv')).resolves.toBe(
      'file:///cache/dados.csv',
    );
    expect(writeAsStringAsync).toHaveBeenCalledWith(
      'file:///cache/dados.csv',
      'a,b',
      { encoding: EncodingType.UTF8 },
    );
  });

  it('retorna null quando a gravacao falha', async () => {
    setOS('android');
    (writeAsStringAsync as jest.Mock).mockRejectedValue(new Error('disco'));
    await expect(
      generateFileURI('a,b', 'dados.csv', 'text/csv'),
    ).resolves.toBeNull();
  });

  it('no web cria uma URL de blob com o texto', async () => {
    setOS('web');
    await expect(generateFileURI('a,b', 'dados.csv', 'text/csv')).resolves.toBe(
      'blob:exemplo',
    );
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/csv');
    expect(blob.size).toBe(3);
  });

  it('no web decodifica o conteudo em base64', async () => {
    setOS('web');
    await generateFileURI(
      btoa('xyz'),
      'planilha.xlsx',
      'application/octet-stream',
      EncodingType.Base64,
    );
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('application/octet-stream');
    expect(blob.size).toBe(3);
  });
});

describe('generatePDF', () => {
  it('recusa HTML vazio', async () => {
    await expect(generatePDF('   ')).rejects.toThrow(
      'Falha ao gerar PDF: Error: Conteúdo HTML não pode estar vazio',
    );
  });

  it('no app gera o PDF com as opcoes padrao mais as customizadas', async () => {
    setOS('ios');
    (printToFileAsync as jest.Mock).mockResolvedValue({ uri: 'file:///a.pdf' });

    await expect(
      generatePDF('<p>oi</p>', 'nota', { width: 300 }),
    ).resolves.toBe('file:///a.pdf');
    expect(printToFileAsync).toHaveBeenCalledWith({
      html: '<p>oi</p>',
      width: 300,
      height: 792,
      base64: false,
      margins: { top: 20, bottom: 20, left: 20, right: 20 },
    });
  });

  it('falha quando o expo-print nao devolve o arquivo', async () => {
    setOS('android');
    (printToFileAsync as jest.Mock).mockResolvedValue({ uri: '' });
    await expect(generatePDF('<p>oi</p>')).rejects.toThrow(
      'Falha ao gerar o arquivo PDF',
    );
  });

  it('no web abre uma janela e imprime depois de carregar', async () => {
    jest.useFakeTimers();
    setOS('web');
    const novaJanela = {
      print: jest.fn(),
      onload: null as null | (() => void),
    };
    const open = jest.fn(() => novaJanela);
    g.window = { open };

    await expect(generatePDF('<p>oi</p>')).resolves.toBe('web-pdf-printed');
    expect(open).toHaveBeenCalledWith('blob:exemplo', '_blank');

    novaJanela.onload?.();
    jest.advanceTimersByTime(300);
    expect(novaJanela.print).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:exemplo');
  });

  it('no web avisa quando o pop-up e bloqueado', async () => {
    setOS('web');
    g.window = { open: jest.fn(() => null) };
    await expect(generatePDF('<p>oi</p>')).rejects.toThrow(
      /pop-ups estão permitidos/,
    );
  });
});

describe('generateCSV', () => {
  it('converte objetos e linhas em CSV', async () => {
    await expect(
      generateCSV([
        { ID: 1, Nome: 'Ana' },
        { ID: 2, Nome: 'Bruno' },
      ]),
    ).resolves.toBe('ID,Nome\r\n1,Ana\r\n2,Bruno');
    await expect(generateCSV([['a', 1]])).resolves.toBe('a,1');
  });

  it('nao gera nada sem dados', async () => {
    await expect(generateCSV([])).resolves.toBeUndefined();
  });
});

describe('generateXLSX', () => {
  it('gera uma planilha em base64 com uma aba por item e nome limitado a 31 letras', async () => {
    const titulo = 'A'.repeat(40);
    const base64 = await generateXLSX([
      { title: titulo, sheetData: [['x', 1]] },
      { title: 'Resumo', sheetData: [['total', 2]] },
    ]);

    const livro = XLSX.read(base64 as string, { type: 'base64' });
    expect(livro.SheetNames).toEqual(['A'.repeat(31), 'Resumo']);
    expect(livro.Sheets.Resumo.A1.v).toBe('total');
  });

  it('nao gera nada sem abas', async () => {
    await expect(generateXLSX([])).resolves.toBeUndefined();
  });
});
