import { formatBRLFromCents } from '@lib/helpers/formatCurrency';
import {
  localDateTimeToISO,
  parseLocalDateTime,
  parseSlotParts,
} from '@lib/helpers/datetime';
import type {
  ChatBotAction,
  ChatBotContext,
  ChatBotMessage,
  ChatBotState,
  QuickReplyOption,
  SendMessageResponse,
  SuggestedTime,
} from '@stores/ChatBot/types';

/**
 * Funcoes puras que traduzem estado/contexto do backend do chatbot em
 * elementos de UI (quick replies, horarios sugeridos, cartao de confirmacao).
 */

export function hasChatBotMessage(
  response: unknown,
): response is SendMessageResponse {
  if (!response || typeof response !== 'object') return false;
  const message = (response as { message?: unknown }).message;
  return typeof message === 'string' && message.trim().length > 0;
}

export function normalizeHistoryMessage(
  message: unknown,
): ChatBotMessage | null {
  if (!message || typeof message !== 'object') return null;
  const item = message as Record<string, unknown>;

  if (
    typeof item.text === 'string' &&
    (item.role === 'user' || item.role === 'bot')
  ) {
    return {
      id: String(item.id),
      role: item.role,
      text: item.text,
      createdAt:
        typeof item.createdAt === 'string'
          ? item.createdAt
          : new Date().toISOString(),
    };
  }

  if (
    typeof item.content === 'string' &&
    (item.sender === 'user' || item.sender === 'bot')
  ) {
    return {
      id: `history_${String(item.id)}`,
      role: item.sender,
      text: item.content,
      createdAt:
        typeof item.createdAt === 'string'
          ? item.createdAt
          : new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Rótulos legíveis exibidos no balão do usuário ao confirmar uma ação.
 * Evita expor JSON bruto ou IDs na UI.
 */
export const ACTION_LABELS: Record<string, string> = {
  confirm_cancel: 'Confirmar cancelamento',
  confirm_reschedule: 'Confirmar alteração de horário',
  confirm_appointment: 'Sim, confirmar',
};

export function formatSuggestedDateLabel(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

/**
 * Deriva quick replies com base no estado e contexto retornados pelo backend.
 *
 * - COLETANDO_SERVICO: chips numerados com nomes de serviços (context.serviceOptions)
 * - COLETANDO_DATA: chips com as datas ISO sugeridas pelo backend
 * - SELECIONANDO_PROFISSIONAL: chips com nomes dos profissionais
 * - CONFIRMACAO: "Sim" / "Não"
 */
export function deriveQuickReplies(
  state: ChatBotState,
  context: ChatBotContext,
): QuickReplyOption[] | undefined {
  if (state === 'COLETANDO_SERVICO') {
    if (context.pendingService) {
      return [
        { label: 'Sim', value: 'sim' },
        { label: 'Não', value: 'não' },
      ];
    }
    // Um contexto estritamente legado ainda não possui o mapeamento de serviços
    // agrupados. A migração desse contrato pertence ao backend.
    if (
      context.serviceOptionsData?.length &&
      !context.serviceChoicesData?.length
    ) {
      return undefined;
    }
    const serviceNames = context.serviceChoicesData?.length
      ? context.serviceChoicesData.map((choice) => choice.title)
      : context.serviceOptions;
    if (serviceNames?.length) {
      return serviceNames.map((name, i) => ({
        label: name,
        value: String(i + 1),
      }));
    }
  }
  if (state === 'COLETANDO_DATA' && context.suggestedDates?.length) {
    return context.suggestedDates.map((date) => ({
      label: formatSuggestedDateLabel(date),
      // Envia a data ISO, não o índice visual. Assim a escolha continua
      // correta mesmo se a sessão for restaurada ou as sugestões mudarem.
      value: date,
    }));
  }
  if (
    state === 'SELECIONANDO_PROFISSIONAL' &&
    context.professionalOptionsData?.length
  ) {
    return context.professionalOptionsData.map((option) => ({
      label: option.professionalName,
      value: String(option.index),
    }));
  }
  if (state === 'CONFIRMACAO') {
    return [
      { label: 'Sim, confirmar', value: 'sim' },
      { label: 'Não, cancelar', value: 'não' },
    ];
  }
  return undefined;
}

/**
 * Parseia um slot do backend em SuggestedTime.
 *
 * Formatos possíveis (conforme doc do backend):
 * - "HH:MM"             → mesmo dia, apenas horário
 * - "YYYY-MM-DD|HH:MM" → dia alternativo, data separada do horário por "|"
 */
export function parseSlot(slot: string, fallbackDate?: string): SuggestedTime {
  try {
    const parts = parseSlotParts(slot, fallbackDate);
    if (parts && parts.time && parts.time.includes(':')) {
      const parsed = parseLocalDateTime(parts.date, parts.time);
      if (!isNaN(parsed.getTime())) {
        const label = new Intl.DateTimeFormat('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(parsed);
        return { label, value: slot };
      }
    }
  } catch (e) {
    console.warn('[useChatSession] Error parsing slot:', slot, e);
  }
  // Mesmo dia — slot já é "HH:MM" ou fallback genérico
  return { label: slot, value: slot };
}

/**
 * Deriva horários sugeridos somente no estado COLETANDO_HORARIO.
 */
export function deriveSuggestedTimes(
  state: ChatBotState,
  context: ChatBotContext,
): SuggestedTime[] | undefined {
  if (state !== 'COLETANDO_HORARIO' || !context.suggestedSlots?.length)
    return undefined;
  const fallbackDate = context.date ?? context.selectedDate;

  // Se o backend enviou metadados dos slots (com nome do profissional e horário real),
  // mapeamos os índices para rótulos legíveis
  const slotsData = context.suggestedSlotsData;

  if (slotsData && slotsData.length > 0) {
    return context.suggestedSlots.map((slot) => {
      const idx = parseInt(slot, 10);
      const matched = slotsData.find((d) => d.index === idx);
      if (matched) {
        return {
          label: `${matched.professionalName} — ${matched.time}`,
          value: slot, // envia o índice para o bot
        };
      }
      return parseSlot(slot, fallbackDate);
    });
  }

  return context.suggestedSlots.map((slot) => parseSlot(slot, fallbackDate));
}

/**
 * Deriva a ação de confirmação de agendamento quando o estado é CONFIRMACAO + CREATE.
 * Permite ao ChatWindow renderizar o AppointmentCard com os dados coletados.
 */
export function deriveBotAction(
  state: ChatBotState,
  context: ChatBotContext,
): ChatBotAction | undefined {
  if (state !== 'CONFIRMACAO' || context.pendingAction !== 'CREATE')
    return undefined;
  if (!context.serviceName && !context.professionalName) return undefined;

  // Backend usa `date` e `time` no contexto (não selectedDate/selectedTime)
  const ctxDate = (context as any).date ?? context.selectedDate;
  const ctxTime = (context as any).time ?? context.selectedTime;
  const startTime =
    ctxDate && ctxTime
      ? localDateTimeToISO(ctxDate, ctxTime)
      : new Date().toISOString();

  // Calcula endTime a partir de serviceDuration (minutos), se disponivel no contexto
  let endTime = startTime;
  if (
    context.serviceDuration &&
    typeof context.serviceDuration === 'number' &&
    ctxDate &&
    ctxTime
  ) {
    const end = parseLocalDateTime(ctxDate, ctxTime);
    end.setMinutes(end.getMinutes() + context.serviceDuration);
    endTime = end.toISOString();
  }

  // Backend usa `servicePrice` (centavos) — fallback para `price`
  const rawPrice = (context as any).servicePrice ?? context.price;

  return {
    type: 'confirm_appointment',
    appointment: {
      serviceTitle: context.serviceName ?? '',
      serviceDescription: context.serviceDescription,
      subcategoryName: context.serviceSubcategoryName,
      categoryName: context.serviceCategoryName,
      professionalName: context.professionalName ?? '',
      professionalRating: context.professionalRating,
      professionalRatingsCount: context.professionalRatingsCount,
      professionalLocation:
        context.professionalCity && context.professionalState
          ? `${context.professionalCity}/${context.professionalState}`
          : null,
      durationMinutes: context.serviceDuration,
      professionalAvatarUri: context.professionalAvatarUri ?? null,
      startTime,
      endTime,
      price:
        rawPrice != null
          ? formatBRLFromCents(
              typeof rawPrice === 'number' ? rawPrice : Number(rawPrice),
            )
          : '',
    },
  };
}

/**
 * Deriva ISO UTC do horário selecionado, alinhado ao checkout.
 * Enviado ao backend para gravar start_time corretamente no banco.
 */
export function resolveSelectedTimeIso(
  messageText: string,
  state: ChatBotState | null,
  context: ChatBotContext | null,
): string | undefined {
  if (!state || !context) return undefined;

  const ctxDate = (context as any).date ?? context.selectedDate;
  const ctxTime = (context as any).time ?? context.selectedTime;

  if (state === 'CONFIRMACAO' && ctxDate && ctxTime) {
    try {
      return localDateTimeToISO(ctxDate, ctxTime);
    } catch (e) {
      console.warn('[useChatSession] Error formatting ISO for CONFIRMACAO:', e);
    }
  }

  if (state === 'COLETANDO_HORARIO') {
    const slotParts = parseSlotParts(messageText.trim(), ctxDate);
    if (slotParts && slotParts.time && slotParts.time.includes(':')) {
      try {
        return localDateTimeToISO(slotParts.date, slotParts.time);
      } catch (e) {
        console.warn('[useChatSession] Error formatting ISO for slotParts:', e);
      }
    }
    if (ctxDate && /^\d{1,2}:\d{2}$/.test(messageText.trim())) {
      try {
        return localDateTimeToISO(ctxDate, messageText.trim());
      } catch (e) {
        console.warn(
          '[useChatSession] Error formatting ISO for time string:',
          e,
        );
      }
    }
  }

  return undefined;
}
