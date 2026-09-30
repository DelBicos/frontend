export const isValidCPF = (cpfValue: string | null | undefined): boolean => {
  if (!cpfValue) return false;
  const cleanCpf = cpfValue.replace(/[^\d]/g, '');
  if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;

  return true;
};

// ─── ChatBot ──────────────────────────────────────────────────────────────────

/**
 * Valida que o session_id do chatbot é um inteiro positivo.
 * O backend rejeita com 400 qualquer valor que não seja inteiro > 0.
 */
export function isValidChatBotSessionId(id: unknown): id is number {
  return Number.isInteger(id) && (id as number) > 0;
}

/**
 * Valida o shape mínimo de uma mensagem armazenada no histórico do chatbot.
 * Impede que dados malformados do backend sejam inseridos no estado.
 */
export function isValidChatBotStoredMessage(msg: unknown): boolean {
  if (!msg || typeof msg !== 'object') return false;
  const m = msg as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    m.id.length > 0 &&
    (m.role === 'user' || m.role === 'bot') &&
    typeof m.text === 'string' &&
    typeof m.createdAt === 'string'
  );
}

