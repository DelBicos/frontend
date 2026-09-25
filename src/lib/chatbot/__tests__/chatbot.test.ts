import {
  ACTION_LABELS,
  deriveBotAction,
  deriveQuickReplies,
  deriveSuggestedTimes,
  formatSuggestedDateLabel,
  hasChatBotMessage,
  normalizeHistoryMessage,
  resolveSelectedTimeIso,
} from '../derive';
import {
  extractRateLimitReset,
  resolveGenericError,
  resolveVoiceError,
} from '../errors';
import {
  activeConversationKind,
  beginConversationRequest,
  finishConversationRequest,
  isCurrentConversationRequest,
  isCurrentRestoreRequest,
  nextRestoreRequestId,
} from '../conversationRequest';
import { localDateTimeToISO } from '@lib/helpers/datetime';

describe('deriveQuickReplies', () => {
  it('pede confirmacao Sim/Nao quando ha servico pendente', () => {
    expect(
      deriveQuickReplies('COLETANDO_SERVICO', {
        pendingService: 'Corte',
      } as any),
    ).toEqual([
      { label: 'Sim', value: 'sim' },
      { label: 'Não', value: 'não' },
    ]);
  });

  it('numera as opcoes de servico', () => {
    expect(
      deriveQuickReplies('COLETANDO_SERVICO', {
        serviceChoicesData: [{ title: 'Corte' }, { title: 'Barba' }],
      } as any),
    ).toEqual([
      { label: 'Corte', value: '1' },
      { label: 'Barba', value: '2' },
    ]);
  });

  it('nao gera chips para contexto legado sem agrupamento', () => {
    expect(
      deriveQuickReplies('COLETANDO_SERVICO', {
        serviceOptionsData: [{}],
        serviceOptions: ['Corte'],
      } as any),
    ).toBeUndefined();
  });

  it('envia a data ISO (nao o indice) nas datas sugeridas', () => {
    const replies = deriveQuickReplies('COLETANDO_DATA', {
      suggestedDates: ['2026-10-05'],
    } as any);
    expect(replies?.[0].value).toBe('2026-10-05');
    expect(replies?.[0].label).not.toBe('2026-10-05');
  });

  it('lista profissionais e confirma no estado CONFIRMACAO', () => {
    expect(
      deriveQuickReplies('SELECIONANDO_PROFISSIONAL', {
        professionalOptionsData: [{ index: 2, professionalName: 'Ana' }],
      } as any),
    ).toEqual([{ label: 'Ana', value: '2' }]);
    expect(deriveQuickReplies('CONFIRMACAO', {} as any)).toHaveLength(2);
    expect(deriveQuickReplies('INICIO', {} as any)).toBeUndefined();
  });
});

describe('formatSuggestedDateLabel', () => {
  it('mantem valores invalidos como vieram', () => {
    expect(formatSuggestedDateLabel('amanha')).toBe('amanha');
    expect(formatSuggestedDateLabel('2026-02-30')).toBe('2026-02-30');
  });

  it('formata datas validas em pt-BR', () => {
    expect(formatSuggestedDateLabel('2026-10-05')).toMatch(/05\/10/);
  });
});

describe('deriveSuggestedTimes', () => {
  it('so existe no estado COLETANDO_HORARIO', () => {
    expect(
      deriveSuggestedTimes('COLETANDO_DATA', {
        suggestedSlots: ['10:00'],
      } as any),
    ).toBeUndefined();
  });

  it('usa nome do profissional quando o backend envia metadados', () => {
    expect(
      deriveSuggestedTimes('COLETANDO_HORARIO', {
        suggestedSlots: ['1'],
        suggestedSlotsData: [
          { index: 1, professionalName: 'Ana', time: '10:00' },
        ],
      } as any),
    ).toEqual([{ label: 'Ana — 10:00', value: '1' }]);
  });

  it('formata slots com data e mantem HH:MM sem data', () => {
    const [withDate] = deriveSuggestedTimes('COLETANDO_HORARIO', {
      suggestedSlots: ['2026-10-05|14:30'],
    } as any)!;
    expect(withDate.value).toBe('2026-10-05|14:30');
    expect(withDate.label).toMatch(/14:30/);

    expect(
      deriveSuggestedTimes('COLETANDO_HORARIO', {
        suggestedSlots: ['09:00'],
      } as any),
    ).toEqual([{ label: '09:00', value: '09:00' }]);
  });
});

describe('deriveBotAction', () => {
  const context = {
    pendingAction: 'CREATE',
    serviceName: 'Corte',
    professionalName: 'Ana',
    date: '2026-10-05',
    time: '10:00',
    serviceDuration: 30,
    servicePrice: 5000,
    professionalCity: 'Sorocaba',
    professionalState: 'SP',
  } as any;

  it('monta o cartao de confirmacao com preco, horario e local', () => {
    const action = deriveBotAction('CONFIRMACAO', context)!;
    expect(action.type).toBe('confirm_appointment');
    const appointment = action.appointment!;
    expect(appointment.startTime).toBe(
      localDateTimeToISO('2026-10-05', '10:00'),
    );
    expect(
      new Date(appointment.endTime).getTime() -
        new Date(appointment.startTime).getTime(),
    ).toBe(30 * 60_000);
    expect(appointment.price).toMatch(/50,00/);
    expect(appointment.professionalLocation).toBe('Sorocaba/SP');
  });

  it('nao gera cartao fora da confirmacao de criacao', () => {
    expect(deriveBotAction('COLETANDO_DATA', context)).toBeUndefined();
    expect(
      deriveBotAction('CONFIRMACAO', { ...context, pendingAction: 'CANCEL' }),
    ).toBeUndefined();
  });
});

describe('resolveSelectedTimeIso', () => {
  it('usa data/hora do contexto na confirmacao', () => {
    expect(
      resolveSelectedTimeIso('sim', 'CONFIRMACAO', {
        date: '2026-10-05',
        time: '10:00',
      } as any),
    ).toBe(localDateTimeToISO('2026-10-05', '10:00'));
  });

  it('interpreta slot com data ou horario digitado', () => {
    expect(
      resolveSelectedTimeIso(
        '2026-10-06|08:15',
        'COLETANDO_HORARIO',
        {} as any,
      ),
    ).toBe(localDateTimeToISO('2026-10-06', '08:15'));
    expect(
      resolveSelectedTimeIso(' 9:30 ', 'COLETANDO_HORARIO', {
        date: '2026-10-05',
      } as any),
    ).toBe(localDateTimeToISO('2026-10-05', '9:30'));
  });

  it('retorna undefined sem estado ou fora dos estados relevantes', () => {
    expect(resolveSelectedTimeIso('sim', null, null)).toBeUndefined();
    expect(resolveSelectedTimeIso('oi', 'INICIO', {} as any)).toBeUndefined();
  });
});

describe('mensagens', () => {
  it('reconhece respostas com mensagem nao vazia', () => {
    expect(hasChatBotMessage({ message: 'Olá' })).toBe(true);
    expect(hasChatBotMessage({ message: '  ' })).toBe(false);
    expect(hasChatBotMessage(null)).toBe(false);
  });

  it('normaliza historico nos dois formatos do backend', () => {
    expect(
      normalizeHistoryMessage({
        id: 1,
        role: 'bot',
        text: 'Oi',
        createdAt: 'x',
      }),
    ).toEqual({ id: '1', role: 'bot', text: 'Oi', createdAt: 'x' });
    expect(
      normalizeHistoryMessage({ id: 2, sender: 'user', content: 'Quero' }),
    ).toMatchObject({ id: 'history_2', role: 'user', text: 'Quero' });
    expect(normalizeHistoryMessage({ foo: 'bar' })).toBeNull();
  });

  it('tem rotulos para as acoes de confirmacao', () => {
    expect(ACTION_LABELS.confirm_cancel).toBeTruthy();
  });
});

describe('erros', () => {
  it('converte RateLimit-Reset (segundos) em milissegundos', () => {
    expect(extractRateLimitReset({ 'ratelimit-reset': '1700000000' })).toBe(
      1_700_000_000_000,
    );
    expect(extractRateLimitReset({ 'ratelimit-reset': 'x' })).toBeNull();
    expect(extractRateLimitReset(undefined)).toBeNull();
  });

  it('mensagens especificas por status', () => {
    expect(resolveGenericError(401)).toMatch(/sessão expirou/);
    expect(resolveGenericError(404)).toMatch(/nova conversa/);
    expect(resolveVoiceError(413)).toMatch(/muito longo/);
    expect(resolveVoiceError(429)).toMatch(/Limite/);
    expect(resolveVoiceError(500)).toBe(resolveGenericError(500));
  });
});

describe('conversationRequest', () => {
  it('nova requisicao aborta e invalida a anterior', () => {
    const first = beginConversationRequest('message');
    const second = beginConversationRequest('restart');

    expect(first.controller.signal.aborted).toBe(true);
    expect(isCurrentConversationRequest(first)).toBe(false);
    expect(activeConversationKind()).toBe('restart');
    expect(finishConversationRequest(first)).toBe(false);
    expect(finishConversationRequest(second)).toBe(true);
    expect(activeConversationKind()).toBeNull();
  });

  it('restauracoes antigas deixam de ser atuais', () => {
    const old = nextRestoreRequestId();
    const current = nextRestoreRequestId();
    expect(isCurrentRestoreRequest(old)).toBe(false);
    expect(isCurrentRestoreRequest(current)).toBe(true);
  });
});
