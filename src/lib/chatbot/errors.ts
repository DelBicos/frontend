/**
 * Mensagens de erro exibidas no chat e leitura do cabecalho de rate limit.
 */

export const EMPTY_CHATBOT_RESPONSE_ERROR =
  'O assistente não conseguiu responder agora. Tente novamente.';

/**
 * Extrai e normaliza o header RateLimit-Reset do Axios.
 * Backend envia epoch Unix em segundos → converte para ms.
 */
export function extractRateLimitReset(
  headers: Record<string, string> | undefined,
): number | null {
  const raw = headers?.['ratelimit-reset'] ?? headers?.['RateLimit-Reset'];
  if (!raw) return null;
  const epoch = Number(raw);
  return isNaN(epoch) ? null : epoch * 1000;
}

/** Trata erros HTTP — retorna mensagem amigável para erros conhecidos. */
export function resolveGenericError(status: number | undefined): string {
  if (status === 401 || status === 403) {
    return 'Sua sessão expirou. Faça login novamente para continuar.';
  }
  if (status === 404)
    return 'Sessão não encontrada. Uma nova conversa será iniciada.';
  return 'Não foi possível enviar a mensagem. Tente novamente.';
}

/** Retorna mensagens específicas para os erros de envio de áudio. */
export function resolveVoiceError(status: number | undefined): string {
  if (status === 401 || status === 403) {
    return 'Sua sessão expirou. Faça login novamente para enviar comandos de voz.';
  }
  if (status === 413) {
    return 'O áudio está muito longo. Grave um comando mais curto e tente novamente.';
  }
  if (status === 415) {
    return 'Este formato de áudio não é compatível. Tente gravar novamente.';
  }
  if (status === 422) {
    return 'Não foi possível entender o áudio. Fale mais perto do microfone e tente novamente.';
  }
  if (status === 429) {
    return 'Limite de uso da API de voz atingido. Aguarde a contagem para tentar novamente.';
  }
  if (status === 502) {
    return 'O serviço de transcrição não respondeu. Tente enviar o áudio novamente.';
  }
  if (status === 503) {
    return 'A transcrição de voz está temporariamente indisponível. Tente novamente em instantes.';
  }
  return resolveGenericError(status);
}
