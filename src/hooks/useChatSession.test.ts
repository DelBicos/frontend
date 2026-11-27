import { act, renderHook } from '@testing-library/react-native';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { useChatBotStore } from '@stores/ChatBot';
import type {
  ChatBotMessage,
  LoadSessionResponse,
  SendMessageResponse,
} from '@stores/ChatBot/types';
import { EMPTY_CHATBOT_RESPONSE_ERROR } from '@lib/chatbot/errors';
import type { AppointmentStatusEvent } from './useAppointmentStatusSocket';
import { useChatSession } from './useChatSession';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('react-native-uuid', () => ({ v4: () => 'uuid-fixo' }));

const get = backendHttpClient.get as jest.Mock;
const post = backendHttpClient.post as jest.Mock;

const botReply = (
  overrides: Partial<SendMessageResponse> = {},
): SendMessageResponse => ({
  session_id: 7,
  message: 'Qual serviço?',
  state: 'COLETANDO_SERVICO',
  context: {},
  ...overrides,
});

const httpError = (status: number, headers?: Record<string, string>) =>
  Object.assign(new Error(`HTTP ${status}`), { response: { status, headers } });

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const store = () => useChatBotStore.getState();
const sentBody = () => post.mock.lastCall?.[1] as Record<string, unknown>;

beforeEach(() => {
  jest.clearAllMocks();
  useChatBotStore.setState({
    sessionId: null,
    messages: [],
    loading: false,
    error: null,
    conversationState: null,
    conversationContext: null,
    lastSentText: null,
    rateLimitResetAt: null,
    hasHydrated: true,
  });
});

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('useChatSession - restauracao da sessao', () => {
  const session = (
    overrides: Partial<LoadSessionResponse['session']> = {},
  ): LoadSessionResponse['session'] => ({
    id: 33,
    state: 'COLETANDO_SERVICO',
    status: 'active',
    channel: 'web',
    started_at: '2026-01-01T10:00:00.000Z',
    ended_at: null,
    appointment_id: null,
    ...overrides,
  });

  it('aguarda a hidratacao do store antes de consultar a API', async () => {
    useChatBotStore.setState({ hasHydrated: false });
    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.restoreActiveSession();
    });
    expect(get).not.toHaveBeenCalled();
  });

  it('limpa a sessao quando o backend nao tem fluxo pendente', async () => {
    useChatBotStore.setState({ sessionId: 99 });
    get.mockResolvedValue({ data: null });
    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.restoreActiveSession();
    });
    expect(get).toHaveBeenCalledWith('/api/chat/bot/session/active');
    expect(store().sessionId).toBeNull();
    expect(store().loading).toBe(false);
  });

  it('restaura historico, sessao e contexto do agendamento', async () => {
    get.mockResolvedValue({
      data: {
        session: session({
          appointment_id: 50,
          appointment_status: 'pending',
          appointment_paid: true,
          context: { serviceName: 'Pintura' },
        }),
        messages: [
          { id: 1, sender: 'user', content: 'oi', createdAt: 'x' },
          { id: 2, sender: 'bot', content: 'Qual serviço?', createdAt: 'y' },
          { id: 3, sender: 'user', content: 'pintura', createdAt: 'z' },
          { invalido: true },
        ],
      },
    });
    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.restoreActiveSession();
    });

    const { messages, sessionId, conversationState, conversationContext } =
      store();
    expect(sessionId).toBe(33);
    expect(messages.map((m) => m.text)).toEqual([
      'oi',
      'Qual serviço?',
      'pintura',
    ]);
    expect(messages[1]).toHaveProperty('quickReplies');
    expect(messages[1]).toHaveProperty('action');
    expect(conversationState).toBe('COLETANDO_SERVICO');
    expect(conversationContext).toEqual({
      serviceName: 'Pintura',
      appointmentId: 50,
      appointmentStatus: 'pending',
      appointmentPaid: true,
    });
  });

  it('restaura sessao sem mensagens e sem estado', async () => {
    get.mockResolvedValue({
      data: {
        session: session({ state: undefined as unknown as 'INICIO' }),
        messages: [],
      },
    });
    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.restoreActiveSession();
    });
    expect(store().sessionId).toBe(33);
    expect(store().messages).toEqual([]);
    expect(store().conversationState).toBeNull();
  });

  it('descarta a resposta se o store mudou durante o carregamento', async () => {
    const pending = deferred<{ data: LoadSessionResponse }>();
    get.mockReturnValue(pending.promise);
    const { result } = renderHook(() => useChatSession());
    let restore: Promise<void> = Promise.resolve();
    act(() => {
      restore = result.current.restoreActiveSession();
    });
    act(() => {
      store().setSessionId(5);
    });
    await act(async () => {
      pending.resolve({ data: { session: session(), messages: [] } });
      await restore;
    });
    expect(store().sessionId).toBe(5);
  });

  it('ignora restauracoes antigas quando outra mais nova comecou', async () => {
    const first = deferred<{ data: LoadSessionResponse | null }>();
    const second = deferred<{ data: LoadSessionResponse | null }>();
    get.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useChatSession());
    let restoreA: Promise<void> = Promise.resolve();
    let restoreB: Promise<void> = Promise.resolve();
    act(() => {
      restoreA = result.current.restoreActiveSession();
      restoreB = result.current.restoreActiveSession();
    });
    await act(async () => {
      first.reject(new Error('antiga'));
      await restoreA;
    });
    expect(store().loading).toBe(true);
    await act(async () => {
      second.resolve({ data: { session: session({ id: 44 }), messages: [] } });
      await restoreB;
    });
    expect(store().sessionId).toBe(44);
    expect(store().loading).toBe(false);
  });

  it('ignora resposta antiga bem-sucedida', async () => {
    const first = deferred<{ data: LoadSessionResponse | null }>();
    get
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce({ data: null });
    const { result } = renderHook(() => useChatSession());
    let restoreA: Promise<void> = Promise.resolve();
    await act(async () => {
      restoreA = result.current.restoreActiveSession();
      await result.current.restoreActiveSession();
    });
    await act(async () => {
      first.resolve({ data: { session: session({ id: 77 }), messages: [] } });
      await restoreA;
    });
    expect(store().sessionId).toBeNull();
  });

  it('inicia uma sessao nova silenciosamente quando a restauracao falha', async () => {
    useChatBotStore.setState({ sessionId: 12, conversationState: 'INICIO' });
    get.mockRejectedValue(new Error('rede'));
    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.restoreActiveSession();
    });
    expect(store().sessionId).toBeNull();
    expect(store().conversationState).toBeNull();
    expect(store().error).toBeNull();
    expect(store().loading).toBe(false);
  });
});

describe('useChatSession - envio de mensagens', () => {
  it('recusa texto vazio ou envio durante carregamento', () => {
    const { result } = renderHook(() => useChatSession());
    expect(result.current.sendMessage('   ')).toBe(false);
    expect(result.current.sendMessage('oi', '  ')).toBe(false);
    act(() => {
      useChatBotStore.setState({ loading: true });
    });
    expect(result.current.sendMessage('oi')).toBe(false);
    expect(post).not.toHaveBeenCalled();
  });

  it('mostra a mensagem otimista e aplica a resposta do bot', async () => {
    post.mockResolvedValue({ data: botReply() });
    const { result } = renderHook(() => useChatSession());
    let accepted = false;
    act(() => {
      accepted = result.current.sendMessage('  quero agendar  ');
    });
    expect(accepted).toBe(true);
    expect(store().messages[0]).toMatchObject({
      role: 'user',
      text: 'quero agendar',
    });
    expect(store().loading).toBe(true);
    await flush();

    expect(post).toHaveBeenCalledWith(
      '/api/chat/bot/message',
      expect.objectContaining({ message: 'quero agendar' }),
      expect.objectContaining({ signal: expect.any(Object) }),
    );
    expect(sentBody()).not.toHaveProperty('session_id');
    expect(store().sessionId).toBe(7);
    expect(store().conversationState).toBe('COLETANDO_SERVICO');
    expect(store().messages[1]).toMatchObject({
      role: 'bot',
      text: 'Qual serviço?',
    });
    expect(store().lastSentText).toBe('quero agendar');
    expect(store().loading).toBe(false);
    expect(store().error).toBeNull();
  });

  it('envia o sessionId valido ja existente', async () => {
    useChatBotStore.setState({ sessionId: 7 });
    post.mockResolvedValue({ data: botReply() });
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendMessage('oi');
    });
    await flush();
    expect(sentBody()).toMatchObject({ session_id: 7 });
  });

  it('quick reply exibe o rotulo e envia o valor', async () => {
    post.mockResolvedValue({ data: botReply() });
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendQuickReply({ label: 'Sim, quero', value: 'sim' });
    });
    await flush();
    expect(store().messages[0].text).toBe('Sim, quero');
    expect(sentBody()).toMatchObject({ message: 'sim' });
  });

  it('zera a sessao quando o fluxo e finalizado, mantendo o historico', async () => {
    post.mockResolvedValue({ data: botReply({ state: 'FINALIZADO' }) });
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendMessage('obrigado');
    });
    await flush();
    expect(store().sessionId).toBeNull();
    expect(store().conversationState).toBeNull();
    expect(store().messages).toHaveLength(2);
  });

  it('limpa o historico e preserva o balao que pediu o reinicio', async () => {
    useChatBotStore.setState({
      messages: [
        { id: 'antiga', role: 'bot', text: 'velha', createdAt: 'x' },
      ] as ChatBotMessage[],
    });
    post.mockResolvedValue({
      data: botReply({ clear_history: true, session_id: 0 }),
    });
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendMessage('começar de novo');
    });
    await flush();
    expect(store().messages.map((m) => m.text)).toEqual([
      'começar de novo',
      'Qual serviço?',
    ]);
    expect(store().sessionId).toBeNull();
  });

  it('mostra erro quando a resposta vem sem mensagem', async () => {
    post.mockResolvedValue({ data: { session_id: 7, message: '  ' } });
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendMessage('oi');
    });
    await flush();
    expect(store().error).toBe(EMPTY_CHATBOT_RESPONSE_ERROR);
    expect(store().messages).toHaveLength(1);
  });

  it('usa o cabecalho RateLimit-Reset no erro 429', async () => {
    post.mockRejectedValue(httpError(429, { 'ratelimit-reset': '1700000000' }));
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendMessage('oi');
    });
    await flush();
    expect(store().rateLimitResetAt).toBe(1_700_000_000_000);
    expect(store().error).toMatch(/Muitas mensagens/);
  });

  it('usa um minuto de espera quando o 429 vem sem cabecalho', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    post.mockRejectedValue(httpError(429));
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendMessage('oi');
    });
    await flush();
    expect(store().rateLimitResetAt).toBe(61_000);
    jest.restoreAllMocks();
  });

  it('zera a sessao no 404 e mostra mensagem amigavel', async () => {
    useChatBotStore.setState({ sessionId: 7 });
    post.mockRejectedValue(httpError(404));
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendMessage('oi');
    });
    await flush();
    expect(store().sessionId).toBeNull();
    expect(store().error).toMatch(/Sessão não encontrada/);
  });

  it('mostra mensagem de sessao expirada no 401', async () => {
    post.mockRejectedValue(httpError(401));
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendMessage('oi');
    });
    await flush();
    expect(store().error).toMatch(/Sua sessão expirou/);
  });

  it('mostra mensagem generica para erro sem resposta HTTP', async () => {
    post.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendMessage('oi');
    });
    await flush();
    expect(store().error).toBe(
      'Não foi possível enviar a mensagem. Tente novamente.',
    );
    expect(store().loading).toBe(false);
  });
});

describe('useChatSession - reinicio, confirmacao e reenvio', () => {
  it('reinicia sem mostrar o comando e ignora a resposta anterior', async () => {
    const stale = deferred<{ data: SendMessageResponse }>();
    post.mockReturnValueOnce(stale.promise).mockResolvedValueOnce({
      data: botReply({ clear_history: true, message: 'Vamos recomeçar' }),
    });
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendMessage('primeira');
    });
    await act(async () => {
      await result.current.restartConversation();
    });
    expect(sentBody()).toMatchObject({ message: 'reiniciar' });
    expect(store().messages.map((m) => m.text)).toEqual(['Vamos recomeçar']);
    expect(result.current.isRestarting).toBe(false);

    await act(async () => {
      stale.resolve({ data: botReply({ message: 'resposta velha' }) });
      await Promise.resolve();
    });
    expect(store().messages.map((m) => m.text)).toEqual(['Vamos recomeçar']);
    expect(store().loading).toBe(false);
  });

  it('ignora erro de requisicao substituida', async () => {
    const stale = deferred<{ data: SendMessageResponse }>();
    post.mockReturnValueOnce(stale.promise).mockResolvedValueOnce({
      data: botReply(),
    });
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendMessage('primeira');
    });
    await act(async () => {
      await result.current.restartConversation();
    });
    await act(async () => {
      stale.reject(httpError(500));
      await Promise.resolve();
    });
    expect(store().error).toBeNull();
  });

  it('nao inicia dois reinicios ao mesmo tempo e mostra o erro', async () => {
    const pending = deferred<{ data: SendMessageResponse }>();
    post.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useChatSession());
    let restart: Promise<void> = Promise.resolve();
    act(() => {
      restart = result.current.restartConversation();
    });
    expect(result.current.isRestarting).toBe(true);
    await act(async () => {
      await result.current.restartConversation();
    });
    expect(post).toHaveBeenCalledTimes(1);
    await act(async () => {
      pending.reject(httpError(500));
      await restart;
    });
    expect(store().error).toBe(
      'Não foi possível enviar a mensagem. Tente novamente.',
    );
    expect(result.current.isRestarting).toBe(false);
  });

  it('confirma com o id do agendamento ou com "sim"', async () => {
    post.mockResolvedValue({ data: botReply() });
    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.confirmAction('confirm_cancel', {
        appointmentId: 15,
      });
    });
    expect(sentBody()).toMatchObject({ message: '15' });
    expect(store().messages[0].text).toBe('Confirmar cancelamento');

    await act(async () => {
      await result.current.confirmAction('desconhecida', {});
    });
    expect(sentBody()).toMatchObject({ message: 'sim' });
    expect(store().messages[2].text).toBe('Confirmar');
    expect(store().loading).toBe(false);
  });

  it('nao confirma durante carregamento e mostra erro de envio', async () => {
    useChatBotStore.setState({ loading: true });
    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.confirmAction('confirm_appointment', {});
    });
    expect(post).not.toHaveBeenCalled();

    act(() => {
      useChatBotStore.setState({ loading: false });
    });
    post.mockRejectedValue(httpError(500));
    await act(async () => {
      await result.current.confirmAction('confirm_appointment', {});
    });
    expect(store().error).toMatch(/Não foi possível enviar/);
  });

  it('reenvia a ultima mensagem sem novo balao do usuario', async () => {
    post.mockRejectedValueOnce(httpError(500));
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.sendMessage('quero pintar');
    });
    await flush();
    expect(store().error).not.toBeNull();

    post.mockResolvedValueOnce({ data: botReply() });
    await act(async () => {
      await result.current.retryLastMessage();
    });
    expect(sentBody()).toMatchObject({ message: 'quero pintar' });
    expect(store().messages.filter((m) => m.role === 'user')).toHaveLength(1);
    expect(store().error).toBeNull();
    expect(store().loading).toBe(false);
  });

  it('nao reenvia sem texto anterior ou durante carregamento', async () => {
    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.retryLastMessage();
    });
    act(() => {
      useChatBotStore.setState({ lastSentText: 'oi', loading: true });
    });
    await act(async () => {
      await result.current.retryLastMessage();
    });
    expect(post).not.toHaveBeenCalled();
  });

  it('mostra o erro quando o reenvio falha', async () => {
    useChatBotStore.setState({ lastSentText: 'oi' });
    post.mockRejectedValue(httpError(500));
    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.retryLastMessage();
    });
    expect(store().error).toMatch(/Não foi possível enviar/);
  });

  it('limpa o rate limit e reporta erros locais', () => {
    useChatBotStore.setState({
      rateLimitResetAt: 123,
      error: 'x',
      lastSentText: 'oi',
    });
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.clearRateLimitReset();
    });
    expect(store().rateLimitResetAt).toBeNull();
    expect(store().error).toBeNull();

    act(() => {
      result.current.reportError('Microfone bloqueado');
    });
    expect(store().error).toBe('Microfone bloqueado');
    expect(store().lastSentText).toBeNull();
  });
});

describe('useChatSession - status do agendamento', () => {
  const statusEvent = (
    overrides: Partial<AppointmentStatusEvent> = {},
  ): AppointmentStatusEvent => ({
    appointment_id: 50,
    status: 'confirmed',
    session_ids: [33],
    message: 'Agendamento confirmado!',
    payment_status: 'paid',
    payment_pending: false,
    paid: true,
    updated_at: '2026-01-01T12:00:00.000Z',
    ...overrides,
  });

  it('ignora eventos de outro agendamento', () => {
    useChatBotStore.setState({
      conversationState: 'AGUARDANDO_CONFIRMACAO',
      conversationContext: { appointmentId: 1 },
    });
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.receiveAppointmentStatus(statusEvent());
    });
    expect(store().messages).toEqual([]);
    expect(store().conversationState).toBe('AGUARDANDO_CONFIRMACAO');
  });

  it('adiciona a mensagem uma unica vez e atualiza o contexto', () => {
    useChatBotStore.setState({
      conversationState: 'AGUARDANDO_CONFIRMACAO',
      conversationContext: { appointmentId: 50, serviceName: 'Pintura' },
    });
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.receiveAppointmentStatus(statusEvent());
      result.current.receiveAppointmentStatus(statusEvent());
    });
    expect(store().messages).toHaveLength(1);
    expect(store().messages[0]).toMatchObject({
      id: 'appointment_status_50_confirmed_true',
      role: 'bot',
      text: 'Agendamento confirmado!',
    });
    expect(store().conversationState).toBe('INICIO');
    expect(store().conversationContext).toEqual({
      appointmentId: 50,
      serviceName: 'Pintura',
      appointmentStatus: 'confirmed',
      appointmentPaid: true,
    });
  });

  it('mantem aguardando confirmacao quando o status e pendente', () => {
    useChatBotStore.setState({ conversationContext: { appointmentId: 50 } });
    const { result } = renderHook(() => useChatSession());
    act(() => {
      result.current.receiveAppointmentStatus(
        statusEvent({ status: 'pending', message: '', paid: false }),
      );
    });
    expect(store().messages).toEqual([]);
    expect(store().conversationState).toBe('AGUARDANDO_CONFIRMACAO');
  });
});
