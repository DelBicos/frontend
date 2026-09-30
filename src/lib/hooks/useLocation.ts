import { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';

import { errorMessage } from '@lib/utils/errors';
export type Coords = {
  latitude: number;
  longitude: number;
};

export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status;
    } catch (e) {
      setError(errorMessage(e, 'Erro ao solicitar permissão de localização'));
      return null;
    }
  }, []);

  const fetchCurrentPosition = useCallback(async (): Promise<Coords | null> => {
    try {
      const permission = permissionStatus || (await requestPermission());
      if (permission !== 'granted') {
        setError('Permissão de localização não concedida');
        return null;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const c = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setCoords(c);
      return c;
    } catch (e) {
      setError(errorMessage(e, 'Erro ao obter localização'));
      return null;
    }
  }, [permissionStatus, requestPermission]);

  useEffect(() => {
    // noop: não solicita permissão automaticamente, apenas atualiza status se já houver
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setPermissionStatus(status);
      } catch {
        // ignore
      }
    })();
  }, []);

  return {
    coords,
    permissionStatus,
    error,
    requestPermission,
    fetchCurrentPosition,
    setCoords,
  } as const;
}

export default useLocation;
