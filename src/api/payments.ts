import { backendHttpClient } from '@lib/helpers/httpClient';

export interface CreatePaymentIntentInput {
  professionalId: number;
  serviceId: number;
  /** Data/hora ISO do inicio do atendimento. */
  selectedTime: string;
  addressId: number;
  /** Agendamento pendente ja criado (fluxo do chatbot). */
  appointmentId?: number;
}

/**
 * Inicia o pagamento e retorna o client_secret do Stripe.
 * O valor e calculado pelo servidor a partir do preco do servico.
 */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
): Promise<string> {
  const { data } = await backendHttpClient.post<{ clientSecret: string }>(
    '/api/payments/create-payment-intent',
    input,
  );
  if (!data?.clientSecret) {
    throw new Error('Resposta de pagamento inválida.');
  }
  return data.clientSecret;
}

/** Extrai o id do PaymentIntent ("pi_...") de um client_secret. */
export function paymentIntentIdFromSecret(clientSecret: string): string {
  return clientSecret.split('_secret_')[0];
}

/**
 * Confirma o pagamento no servidor, que cria (ou vincula) o agendamento.
 * O usuario e identificado pelo token; a chamada e idempotente.
 */
export async function confirmPayment(paymentIntentId: string) {
  const { data } = await backendHttpClient.post<{
    message: string;
    appointment: Record<string, any>;
  }>('/api/payments/confirm', { paymentIntentId });
  return data;
}
