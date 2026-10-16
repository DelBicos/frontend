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

export interface ProximityWarningEvent {
  appointment_id: number;
  message: string;
  estimated_minutes: number;
  distance_meters: number;
}

export interface LocationArrivedEvent {
  appointment_id: number;
  message: string;
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
  dest_lat?: number;
  dest_lng?: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}): void {
  if (locationSocket && locationSocket.connected) {
    locationSocket.emit('location:send', payload);
  }
}

export function sendLocationArrived(payload: {
  appointment_id: number;
  client_user_id?: number;
}): void {
  if (locationSocket && locationSocket.connected) {
    locationSocket.emit('location:arrived', payload);
  }
}

export function useLocationSocket(
  appointmentId?: number | string,
  onLocationUpdate?: (event: LocationUpdateEvent) => void,
  onProximityWarning?: (event: ProximityWarningEvent) => void,
  onLocationArrived?: (event: LocationArrivedEvent) => void,
): {
  connected: boolean;
  sendLocation: typeof sendLocationUpdate;
  sendArrived: typeof sendLocationArrived;
} {
  const token = useUserStore((state) => state.token);
  const locationCbRef = useRef(onLocationUpdate);
  const proximityCbRef = useRef(onProximityWarning);
  const arrivedCbRef = useRef(onLocationArrived);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    locationCbRef.current = onLocationUpdate;
    proximityCbRef.current = onProximityWarning;
    arrivedCbRef.current = onLocationArrived;
  }, [onLocationUpdate, onProximityWarning, onLocationArrived]);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      return;
    }

    const socket = ensureLocationSocket(token);
    if (!socket) return;

    const joinRoom = () => {
      if (appointmentId) {
        const numericId = Number(appointmentId);
        if (!isNaN(numericId) && numericId > 0) {
          socket.emit('appointment:join', numericId);
        }
      }
    };

    const handleConnect = () => {
      setConnected(true);
      joinRoom();
    };
    const handleDisconnect = () => setConnected(false);

    const handleLocationUpdate = (event: LocationUpdateEvent) => {
      if (
        appointmentId &&
        String(event.appointment_id) === String(appointmentId)
      ) {
        locationCbRef.current?.(event);
      }
    };

    const handleProximityWarning = (event: ProximityWarningEvent) => {
      if (
        appointmentId &&
        String(event.appointment_id) === String(appointmentId)
      ) {
        proximityCbRef.current?.(event);
      }
    };

    const handleLocationArrived = (event: LocationArrivedEvent) => {
      if (
        appointmentId &&
        String(event.appointment_id) === String(appointmentId)
      ) {
        arrivedCbRef.current?.(event);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('location:update', handleLocationUpdate);
    socket.on('location:proximity_warning', handleProximityWarning);
    socket.on('location:arrived', handleLocationArrived);

    if (socket.connected) {
      joinRoom();
    }

    setConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('location:update', handleLocationUpdate);
      socket.off('location:proximity_warning', handleProximityWarning);
      socket.off('location:arrived', handleLocationArrived);
    };
  }, [token, appointmentId]);

  return {
    connected,
    sendLocation: sendLocationUpdate,
    sendArrived: sendLocationArrived,
  };
}
