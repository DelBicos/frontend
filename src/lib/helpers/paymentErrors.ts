// Mensagens retornadas pelo backend quando a validação de posse/estado do
// agendamento falha em create-payment-intent ou confirm. Nesses casos o
// pagamento não deve ser retentado automaticamente: o app precisa recarregar
// o estado do agendamento e orientar o usuário a reiniciar o checkout.
const APPOINTMENT_VALIDATION_ERROR_MARKERS = [
  'não encontrado ou não pertence a este usuário',
  'já possui outro pagamento registrado',
  'não pode mais receber pagamento',
  'não corresponde ao preço atual do serviço',
];

export function isAppointmentValidationError(message?: string | null): boolean {
  if (!message) return false;
  return APPOINTMENT_VALIDATION_ERROR_MARKERS.some((marker) =>
    message.includes(marker),
  );
}
