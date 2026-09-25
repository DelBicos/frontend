import { isAxiosError } from 'axios';

/**
 * Extrai uma mensagem legivel de um erro de requisicao.
 * O backend responde erros como { error: string } (alguns legados usam { message }).
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      { error?: unknown; message?: unknown } | undefined;
    const message = data?.error ?? data?.message;
    if (typeof message === 'string' && message.trim()) return message;
    if (!error.response) {
      return 'Não foi possível se conectar ao servidor. Verifique sua internet.';
    }
  }
  return fallback;
}

/** Status HTTP de um erro de requisicao (ou undefined se nao houve resposta). */
export function getApiErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

/** Codigo estavel enviado pelo backend (ex.: "SESSION_EXPIRED"). */
export function getApiErrorCode(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  const code = (error.response?.data as { code?: unknown } | undefined)?.code;
  return typeof code === 'string' ? code : undefined;
}
