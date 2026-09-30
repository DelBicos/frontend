import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_DOMAIN } from '@config/varEnvs';
import { useUserStore } from '@stores/User';

export interface LocationUpdateEvent {
  appointment_id: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

let locationSocket: Socket | null = null;
let locationToken: string | null = null;

function ensureLocationSocket(token: string): Socket | null {
  if (locationSocket && locationToken === token) return locationSocket;

  if (locationSocket) {
    locationSocket.removeAllListeners();
    locationSocket.disconnect();
  }

  locationToken = token;
  locationSocket = io(WS_DOMAIN, {
    auth: { token },
    transports: ['websocket'],
  });

  return locationSocket;
}

export function sendLocationUpdate(payload: {
  appointment_id: number;
  client_user_id?: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}): void {
  if (locationSocket && locationSocket.connected) {
    locationSocket.emit('location:send', payload);
  }
}

export function useLocationSocket(
  appointmentId?: number | string,
  onLocationUpdate?: (event: LocationUpdateEvent) => void,
): { connected: boolean; sendLocation: typeof sendLocationUpdate } {
  const token = useUserStore((state) => state.token);
  const callbackRef = useRef(onLocationUpdate);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    callbackRef.current = onLocationUpdate;
  }, [onLocationUpdate]);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      return;
    }

    const socket = ensureLocationSocket(token);
    if (!socket) return;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleLocationUpdate = (event: LocationUpdateEvent) => {
      if (appointmentId && String(event.appointment_id) === String(appointmentId)) {
        callbackRef.current?.(event);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('location:update', handleLocationUpdate);

    if (appointmentId) {
      socket.emit('appointment:join', Number(appointmentId));
    }

    setConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('location:update', handleLocationUpdate);
    };
  }, [token, appointmentId]);

  return { connected, sendLocation: sendLocationUpdate };
}
