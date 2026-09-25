/**
 * Controle de concorrencia das requisicoes do chatbot.
 *
 * Apenas uma requisicao de conversa fica ativa por vez: iniciar outra
 * (ex.: Reiniciar) aborta a anterior, e respostas antigas sao ignoradas.
 * Estado em nivel de modulo porque varias ChatWindows compartilham o store.
 */

let _conversationRequestId = 0;
let _restoreRequestId = 0;

export type ConversationRequestKind = 'message' | 'voice' | 'restart';

export interface ConversationRequest {
  id: number;
  kind: ConversationRequestKind;
  controller: AbortController;
}

let _activeConversationRequest: ConversationRequest | null = null;

export function beginConversationRequest(
  kind: ConversationRequestKind,
): ConversationRequest {
  _activeConversationRequest?.controller.abort();
  const request = {
    id: ++_conversationRequestId,
    kind,
    controller: new AbortController(),
  };
  _activeConversationRequest = request;
  return request;
}

export function isCurrentConversationRequest(
  request: ConversationRequest,
): boolean {
  return _activeConversationRequest?.id === request.id;
}

export function finishConversationRequest(
  request: ConversationRequest,
): boolean {
  if (!isCurrentConversationRequest(request)) return false;
  _activeConversationRequest = null;
  return true;
}

/** Tipo da requisicao de conversa em andamento (ou null). */
export function activeConversationKind(): ConversationRequestKind | null {
  return _activeConversationRequest?.kind ?? null;
}

/** Invalida restauracoes de sessao em andamento e retorna o novo id. */
export function nextRestoreRequestId(): number {
  return ++_restoreRequestId;
}

export function isCurrentRestoreRequest(id: number): boolean {
  return id === _restoreRequestId;
}
