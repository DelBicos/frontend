import { useRef, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import {
  useLocationSocket,
  sendLocationUpdate,
  sendLocationArrived,
} from '@hooks/useLocationSocket';

interface UseDeslocamentoTrackingParams {
  numericAppointmentId?: number;
  appointmentId: number | string;
  destCoords: { lat?: number; lng?: number };
}

export const useDeslocamentoTracking = ({
  numericAppointmentId,
  appointmentId,
  destCoords,
}: UseDeslocamentoTrackingParams) => {
  useLocationSocket(numericAppointmentId);

  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  );

  const startGpsTracking = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }

      const targetApptId =
        numericAppointmentId ||
        (typeof appointmentId === 'number'
          ? appointmentId
          : Number(appointmentId));

      // Envia imediatamente a primeira localização ao iniciar, sem aguardar deslocamento
      try {
        const initialLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (initialLoc && targetApptId && !isNaN(targetApptId)) {
          sendLocationUpdate({
            appointment_id: targetApptId,
            dest_lat: destCoords.lat,
            dest_lng: destCoords.lng,
            latitude: initialLoc.coords.latitude,
            longitude: initialLoc.coords.longitude,
            heading: initialLoc.coords.heading || 0,
            speed: initialLoc.coords.speed || 0,
          });
        }
      } catch {
        // Silenciosamente ignora falha inicial
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000,
          distanceInterval: 1,
        },
        (loc) => {
          if (targetApptId && !isNaN(targetApptId)) {
            sendLocationUpdate({
              appointment_id: targetApptId,
              dest_lat: destCoords.lat,
              dest_lng: destCoords.lng,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              heading: loc.coords.heading || 0,
              speed: loc.coords.speed || 0,
            });
          }
        },
      );

      locationSubscriptionRef.current = subscription;
    } catch {
      // Silenciosamente ignora indisponibilidade temporária de GPS
    }
  }, [numericAppointmentId, appointmentId, destCoords.lat, destCoords.lng]);

  const stopGpsTracking = useCallback(() => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  }, []);

  const notifyArrived = useCallback(() => {
    stopGpsTracking();
    const targetApptId =
      numericAppointmentId ||
      (typeof appointmentId === 'number'
        ? appointmentId
        : Number(appointmentId));
    if (targetApptId && !isNaN(targetApptId)) {
      sendLocationArrived({ appointment_id: targetApptId });
    }
  }, [stopGpsTracking, numericAppointmentId, appointmentId]);

  useEffect(() => {
    return () => {
      stopGpsTracking();
    };
  }, [stopGpsTracking]);

  return {
    startGpsTracking,
    stopGpsTracking,
    notifyArrived,
  };
};
