import { useCallback, useEffect, useRef, useState } from 'react';
import { backendHttpClient } from '@lib/helpers/httpClient';
import type { AppointmentStatusEvent } from '@hooks/useAppointmentStatusSocket';
import { useAppointmentStatusSocket } from '@hooks/useAppointmentStatusSocket';

interface AppointmentPollingResult {
  appointmentStatus: string | null;
  appointmentPaid: boolean;
}

interface AppointmentStatusResponse extends AppointmentStatusEvent {
  waiting_for_professional: boolean;
  poll_after_ms: number | null;
}

/**
 * Recebe mudanças via Socket.IO e usa o endpoint específico como contingência.
 * O polling permanece ativo enquanto aguarda aceite ou pagamento.
 */
export function useAppointmentPolling(
  appointmentId: number | undefined,
  initialStatus: string | null,
  initialPaid: boolean,
  onStatusEvent: (event: AppointmentStatusEvent) => void,
): AppointmentPollingResult {
  const [appointmentStatus, setAppointmentStatus] = useState<string | null>(
    initialStatus,
  );
  const [appointmentPaid, setAppointmentPaid] = useState(initialPaid);
  const lastEventKeyRef = useRef<string | null>(null);

  const applyStatus = useCallback(
    (event: AppointmentStatusEvent, notifyChat: boolean) => {
      if (event.appointment_id !== appointmentId) return;
      setAppointmentStatus(event.status);
      setAppointmentPaid(event.paid);

      if (notifyChat && event.status !== 'pending') {
        const key = `${event.appointment_id}:${event.status}:${event.paid}`;
        if (lastEventKeyRef.current !== key) {
          lastEventKeyRef.current = key;
          onStatusEvent(event);
        }
      }
    },
    [appointmentId, onStatusEvent],
  );

  const handleSocketStatus = useCallback(
    (event: AppointmentStatusEvent) => applyStatus(event, true),
    [applyStatus],
  );
  useAppointmentStatusSocket(handleSocketStatus);

  useEffect(() => {
    setAppointmentStatus(initialStatus);
    setAppointmentPaid(initialPaid);
    lastEventKeyRef.current = null;
  }, [appointmentId, initialPaid, initialStatus]);

  useEffect(() => {
    if (!appointmentId) return;
    let canceled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const checkStatus = async () => {
      try {
        const { data } = await backendHttpClient.get<AppointmentStatusResponse>(
          `/api/chat/bot/appointments/${appointmentId}/status`,
        );
        if (canceled) return;
        applyStatus(data, true);
        if (data.poll_after_ms) {
          timer = setTimeout(checkStatus, data.poll_after_ms);
        }
      } catch (error) {
        if (!canceled) {
          console.warn(
            '[useAppointmentPolling] Error checking appointment status:',
            error,
          );
          timer = setTimeout(checkStatus, 10_000);
        }
      }
    };

    checkStatus();
    return () => {
      canceled = true;
      if (timer) clearTimeout(timer);
    };
  }, [appointmentId, applyStatus]);

  return { appointmentStatus, appointmentPaid };
}
