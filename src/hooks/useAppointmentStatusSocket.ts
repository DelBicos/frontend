import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_DOMAIN } from '@config/varEnvs';
import { useUserStore } from '@stores/User';

export interface AppointmentStatusEvent {
  appointment_id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  session_ids: number[];
  message: string;
  payment_status: 'not_available' | 'pending' | 'paid';
  payment_pending: boolean;
  paid: boolean;
  updated_at: string;
}

interface AppointmentStatusSubscriber {
  onEvent: (event: AppointmentStatusEvent) => void;
  onConnectionChange: (connected: boolean) => void;
}

const subscribers = new Set<AppointmentStatusSubscriber>();
let sharedSocket: Socket | null = null;
let sharedToken: string | null = null;

function disconnectSharedSocket(): void {
  sharedSocket?.removeAllListeners();
  sharedSocket?.disconnect();
  sharedSocket = null;
  sharedToken = null;
}

function ensureSharedSocket(token: string): void {
  if (sharedSocket && sharedToken === token) return;

  disconnectSharedSocket();
  sharedToken = token;
  sharedSocket = io(WS_DOMAIN, {
    auth: { token },
    transports: ['websocket'],
  });

  sharedSocket.on('connect', () => {
    subscribers.forEach((subscriber) => subscriber.onConnectionChange(true));
  });
  sharedSocket.on('disconnect', () => {
    subscribers.forEach((subscriber) => subscriber.onConnectionChange(false));
  });
  sharedSocket.on('appointment:status', (event: AppointmentStatusEvent) => {
    if (!event?.appointment_id) return;
    subscribers.forEach((subscriber) => subscriber.onEvent(event));
  });
}

/** Escuta mudanças de agendamento destinadas ao usuário autenticado. */
export function useAppointmentStatusSocket(
  onStatusChange: (event: AppointmentStatusEvent) => void,
): boolean {
  const token = useUserStore((state) => state.token);
  const callbackRef = useRef(onStatusChange);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    callbackRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      return;
    }

    const subscriber: AppointmentStatusSubscriber = {
      onEvent: (event) => callbackRef.current(event),
      onConnectionChange: setConnected,
    };
    subscribers.add(subscriber);
    ensureSharedSocket(token);
    setConnected(sharedSocket?.connected === true);

    return () => {
      subscribers.delete(subscriber);
      setConnected(false);
      if (subscribers.size === 0) disconnectSharedSocket();
    };
  }, [token]);

  return connected;
}
