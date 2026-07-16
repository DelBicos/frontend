import { useState, useEffect } from 'react';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { ChatBotState } from '@stores/ChatBot/types';

interface AppointmentPollingResult {
  appointmentStatus: string | null;
  appointmentPaid: boolean;
}

/**
 * Faz polling a cada 10s em GET /api/appointments (JWT-scoped) para checar
 * se o agendamento recém-criado foi aceito e/ou pago pelo profissional.
 * Só ativo quando conversationState === 'FINALIZADO' e appointmentId existe.
 */
export function useAppointmentPolling(
  appointmentId: number | undefined,
  conversationState: ChatBotState | null,
): AppointmentPollingResult {
  const [appointmentStatus, setAppointmentStatus] = useState<string | null>(null);
  const [appointmentPaid, setAppointmentPaid] = useState(false);

  useEffect(() => {
    if (!appointmentId || conversationState !== 'FINALIZADO') {
      setAppointmentStatus(null);
      setAppointmentPaid(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await backendHttpClient.get<
          Array<{ id: number; status: string; payment_intent_id?: string | null }>
        >('/api/appointments');
        const found = response.data.find((a) => a.id === appointmentId);
        if (found) {
          setAppointmentStatus(found.status);
          setAppointmentPaid(!!found.payment_intent_id);
        }
      } catch (e) {
        console.warn('[useAppointmentPolling] Error checking appointment status:', e);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10_000);
    return () => clearInterval(interval);
  }, [appointmentId, conversationState]);

  return { appointmentStatus, appointmentPaid };
}
