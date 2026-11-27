jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { defaults: { baseURL: 'https://api.exemplo.test/' } },
}));

class FakeXHR {
  static instances: FakeXHR[] = [];
  status = 0;
  responseText = '';
  url = '';
  headers: Record<string, string> = {};
  onprogress: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onload: (() => void) | null = null;
  open = jest.fn((_method: string, url: string) => {
    this.url = url;
  });
  setRequestHeader = jest.fn((name: string, value: string) => {
    this.headers[name] = value;
  });
  send = jest.fn();
  abort = jest.fn();

  constructor() {
    FakeXHR.instances.push(this);
  }

  push(text: string, status = 200) {
    this.status = status;
    this.responseText += text;
    this.onprogress?.();
  }
}

const originalXHR = global.XMLHttpRequest;

type SSEModule = typeof import('../sse');
let sse: SSEModule;

beforeEach(() => {
  jest.useFakeTimers();
  FakeXHR.instances = [];
  global.XMLHttpRequest = FakeXHR as unknown as typeof XMLHttpRequest;
  jest.isolateModules(() => {
    sse = require('../sse') as SSEModule;
  });
});

afterEach(() => {
  sse.closeSSE();
  jest.useRealTimers();
  global.XMLHttpRequest = originalXHR;
});

const lastXHR = () => FakeXHR.instances[FakeXHR.instances.length - 1];

describe('sse', () => {
  it('conecta uma unica vez ao endpoint de eventos', () => {
    const client = sse.initSSE();
    expect(sse.initSSE()).toBe(client);
    expect(sse.getSSE()).toBe(client);
    expect(FakeXHR.instances).toHaveLength(1);
    expect(lastXHR().url).toBe('https://api.exemplo.test/api/services/events');
    expect(lastXHR().headers).toEqual({
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
    });
    expect(lastXHR().send).toHaveBeenCalled();
  });

  it('entrega os eventos nomeados e as mensagens padrao aos ouvintes', () => {
    const client = sse.initSSE();
    const onUpdate = jest.fn();
    const onMessage = jest.fn();
    client.addEventListener('service-updated', onUpdate);
    client.addEventListener('message', onMessage);

    lastXHR().push('event: service-updated\ndata: {"id":1}\n\n');
    lastXHR().push('data: ola\n\n\n\nevent: vazio\n\n');

    expect(onUpdate).toHaveBeenCalledWith('{"id":1}');
    expect(onMessage).toHaveBeenCalledWith('ola');
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledTimes(1);
  });

  it('isola erros de um ouvinte e permite remover ouvintes', () => {
    const client = sse.initSSE();
    const quebra = jest.fn(() => {
      throw new Error('handler');
    });
    const ok = jest.fn();
    client.addEventListener('message', quebra);
    client.addEventListener('message', ok);

    lastXHR().push('data: 1\n\n');
    expect(ok).toHaveBeenCalledWith('1');

    client.removeEventListener('message', ok);
    client.removeEventListener('outro', ok);
    lastXHR().push('data: 2\n\n');
    expect(ok).toHaveBeenCalledTimes(1);
  });

  it('ignora progresso sem texto novo', () => {
    const client = sse.initSSE();
    const ok = jest.fn();
    client.addEventListener('message', ok);
    lastXHR().push('');
    expect(ok).not.toHaveBeenCalled();
  });

  it('reconecta com espera crescente e volta ao minimo apos conectar', () => {
    sse.initSSE();

    lastXHR().onerror?.();
    jest.advanceTimersByTime(4_999);
    expect(FakeXHR.instances).toHaveLength(1);
    jest.advanceTimersByTime(1);
    expect(FakeXHR.instances).toHaveLength(2);

    lastXHR().onload?.();
    jest.advanceTimersByTime(9_999);
    expect(FakeXHR.instances).toHaveLength(2);
    jest.advanceTimersByTime(1);
    expect(FakeXHR.instances).toHaveLength(3);

    lastXHR().push('data: ok\n\n', 200);
    lastXHR().onload?.();
    jest.advanceTimersByTime(5_000);
    expect(FakeXHR.instances).toHaveLength(4);
  });

  it('limita a espera entre tentativas a 60 segundos', () => {
    sse.initSSE();
    for (let i = 0; i < 6; i += 1) {
      lastXHR().onerror?.();
      jest.advanceTimersByTime(60_000);
    }
    const antes = FakeXHR.instances.length;
    lastXHR().onerror?.();
    jest.advanceTimersByTime(59_999);
    expect(FakeXHR.instances).toHaveLength(antes);
    jest.advanceTimersByTime(1);
    expect(FakeXHR.instances).toHaveLength(antes + 1);
  });

  it('fecha a conexao, cancela a reconexao e permite abrir de novo', () => {
    const client = sse.initSSE();
    const xhr = lastXHR();
    xhr.onerror?.();

    sse.closeSSE();
    expect(xhr.abort).toHaveBeenCalled();
    expect(sse.getSSE()).toBeNull();

    jest.advanceTimersByTime(60_000);
    expect(FakeXHR.instances).toHaveLength(1);

    xhr.onerror?.();
    xhr.onprogress?.();
    jest.advanceTimersByTime(60_000);
    expect(FakeXHR.instances).toHaveLength(1);

    expect(sse.initSSE()).not.toBe(client);
    expect(FakeXHR.instances).toHaveLength(2);
  });
});
