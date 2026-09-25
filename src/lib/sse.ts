import { backendHttpClient } from '@lib/helpers/httpClient';

type SSEListener = (data: string) => void;

interface RNSSEClient {
  addEventListener: (event: string, listener: SSEListener) => void;
  removeEventListener: (event: string, listener: SSEListener) => void;
  close: () => void;
}

let client: RNSSEClient | null = null;

const MIN_RETRY_MS = 5_000;
const MAX_RETRY_MS = 60_000;

/**
 * Cria um cliente SSE usando XMLHttpRequest com streaming (onprogress).
 * Compatível com React Native onde fetch não expõe res.body como ReadableStream.
 */
function createSSEClient(url: string): RNSSEClient {
  const listeners = new Map<string, Set<SSEListener>>();
  let closed = false;
  let xhr: XMLHttpRequest | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let retryDelay = MIN_RETRY_MS;

  // Backoff exponencial: evita martelar o servidor quando ele recusa a
  // conexao (ex.: 429/503). Volta ao minimo quando a conexao funciona.
  const scheduleReconnect = () => {
    if (closed) return;
    reconnectTimer = setTimeout(connect, retryDelay);
    retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
  };

  const emit = (event: string, data: string) => {
    listeners.get(event)?.forEach((fn) => {
      try {
        fn(data);
      } catch (e) {
        /* ignorar erros em handlers */
      }
    });
  };

  const parseAndEmit = (chunk: string) => {
    // Cada bloco SSE é separado por \n\n
    const blocks = chunk.split('\n\n');
    for (const block of blocks) {
      if (!block.trim()) continue;
      let eventName = 'message';
      let data = '';
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
      }
      if (data) emit(eventName, data);
    }
  };

  const connect = () => {
    if (closed) return;

    xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'text/event-stream');
    xhr.setRequestHeader('Cache-Control', 'no-cache');

    let processed = 0;

    xhr.onprogress = () => {
      if (!xhr) return;
      if (xhr.status === 200) retryDelay = MIN_RETRY_MS;
      const newChunk = xhr.responseText.slice(processed);
      processed = xhr.responseText.length;
      if (newChunk) parseAndEmit(newChunk);
    };

    xhr.onerror = scheduleReconnect;

    // Conexao encerrada (ou recusada) pelo servidor: reconectar com backoff.
    xhr.onload = scheduleReconnect;

    xhr.send();
  };

  connect();

  return {
    addEventListener: (event, listener) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
    },
    removeEventListener: (event, listener) => {
      listeners.get(event)?.delete(listener);
    },
    close: () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      xhr?.abort();
      xhr = null;
      listeners.clear();
    },
  };
}

export const initSSE = (): RNSSEClient => {
  if (client) return client;

  const base = backendHttpClient.defaults.baseURL || 'http://localhost:3000';
  const url = `${base.replace(/\/$/, '')}/api/services/events`;

  client = createSSEClient(url);
  return client;
};

export const getSSE = () => client;

export const closeSSE = () => {
  client?.close();
  client = null;
};
