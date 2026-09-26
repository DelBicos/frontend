import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useUserStore } from '@stores/User';
import { AddressData } from './types';

const LOCATIONIQ_API_KEY = process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY || '';

if (!LOCATIONIQ_API_KEY) {
  console.warn(
    '⚠️ A chave da API LocationIQ não está definida no arquivo .env (EXPO_PUBLIC_LOCATIONIQ_API_KEY)',
  );
}

interface LocationContextType {
  address: AddressData | null;
  city: string | undefined;
  state: string | undefined;
  setLocation: (city: string, state: string) => Promise<void>; // Agora é assíncrona
  lookupByCoordinates: (latitude: number, longitude: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

function formatBrazilianAddress(data: any): AddressData {
  try {
    const components = data.address || {};

    // Cidade
    const city =
      components.city ||
      components.town ||
      components.suburb ||
      components.village ||
      components.municipality ||
      '';

    // Estado
    const state = components.state || components.state_district || '';

    // Bairro
    const neighbourhood =
      components.neighbourhood ||
      components.suburb ||
      components.residential ||
      components.city_district ||
      '';

    // Rua
    const road =
      components.road ||
      components.street ||
      components.pedestrian ||
      components.footway ||
      '';

    // Número
    const houseNumber =
      components.house_number || components.street_number || '';

    // CEP
    const cep = components.postcode || '';

    let formattedParts: string[] = [];

    // 1. Rua + Número
    if (road) {
      const streetPart = houseNumber ? `${road}, ${houseNumber}` : road;
      formattedParts.push(streetPart);
    }

    // 2. Bairro
    if (neighbourhood && neighbourhood !== city) {
      formattedParts.push(neighbourhood);
    }

    // 3. Cidade - Estado
    if (city) {
      const locationPart = state ? `${city} - ${state}` : city;
      formattedParts.push(locationPart);
    }

    // 4. CEP
    if (cep) {
      formattedParts.push(formatCEP(cep));
    }

    const formattedAddress =
      formattedParts.length > 0
        ? formattedParts.join(', ')
        : data.display_name || 'Endereço não identificado';

    return {
      display_name: data.display_name || formattedAddress,
      formatted: formattedAddress,
      place_id: data.place_id,
      licence: data.licence,
      osm_type: data.osm_type,
      osm_id: data.osm_id,
      boundingbox: data.boundingbox,
      lat: String(data.lat),
      lon: String(data.lon),
      lng: String(data.lon),
      class: data.class,
      type: data.type,
      formatted_address: formattedAddress,
      road,
      neighbourhood,
      city,
      state,
      postcode: cep,
      house_number: houseNumber,
      country_iso: components.country_code
        ? components.country_code.toUpperCase()
        : 'BR',
      ...components,
    };
  } catch (error) {
    console.error('Erro ao formatar endereço brasileiro:', error);
    return {
      display_name: data.display_name || 'Endereço não identificado',
      formatted: data.display_name || 'Endereço não identificado',
      lat: '0',
      lon: '0',
      lng: '0',
      ...data,
    };
  }
}

function formatCEP(cep: string): string {
  if (!cep) return '';
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length === 8 && !cep.includes('-')) {
    return `${cleanCep.substring(0, 5)}-${cleanCep.substring(5)}`;
  }
  return cep;
}

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [address, setAddress] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const lookupByQuery = useCallback(async (query: string) => {
    if (!LOCATIONIQ_API_KEY) return null;

    try {
      const url = `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`;
      const res = await fetch(url);
      if (!res.ok) return null;

      const json = await res.json();
      if (json && json.length > 0) {
        return formatBrazilianAddress(json[0]);
      }
      return null;
    } catch (e) {
      console.error('Erro no geocoding por texto:', e);
      return null;
    }
  }, []);

  const setLocation = async (city: string, state: string) => {
    setLoading(true);
    setError(null);

    try {
      const foundAddress = await lookupByQuery(`${city}, ${state}, Brazil`);

      if (foundAddress) {
        setAddress(foundAddress);
      } else {
        console.warn(
          `Não foi possível encontrar coordenadas para ${city}, ${state}`,
        );
        setAddress({
          ...address,
          city,
          state,
          formatted: `${city} - ${state}`,
          display_name: `${city} - ${state}`,
          lat: '0',
          lng: '0',
          lon: '0',
          street: '',
          number: '',
          neighborhood: '',
          postal_code: '',
          country_iso: 'BR',
        } as AddressData);
      }
    } catch {
      setError('Erro ao definir localização.');
    } finally {
      setLoading(false);
    }
  };

  const lookupByCoordinates = useCallback(
    async (latitude: number, longitude: number): Promise<void> => {
      if (!LOCATIONIQ_API_KEY) {
        const errorMessage =
          'Chave da API LocationIQ não configurada (EXPO_PUBLIC_LOCATIONIQ_API_KEY)';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      setError(null);
      setLoading(true);

      try {
        const url = `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`LocationIQ respondeu com ${res.status}: ${text}`);
        }

        const json = await res.json();

        if (!json || json.error) {
          throw new Error(json.error?.message || 'Resposta inválida da API');
        }

        const addressData = formatBrazilianAddress(json);

        setAddress(addressData);
      } catch (err: any) {
        const errorMessage =
          err?.message ?? 'Erro desconhecido no reverse geocoding';
        console.error('❌ Erro no geocoding:', errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const currentCity = address?.city;
  const currentState = address?.state;

  // Logado e sem local escolhido: usa a cidade do endereco da conta
  // (no web e no app).
  const accountAddress = useUserStore((st) => st.address);
  const setLocationRef = useRef(setLocation);
  setLocationRef.current = setLocation;
  useEffect(() => {
    if (accountAddress?.city && !address?.city) {
      setLocationRef.current(accountAddress.city, accountAddress.state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountAddress?.city, accountAddress?.state]);

  return (
    <LocationContext.Provider
      value={{
        address,
        city: currentCity,
        state: currentState,
        setLocation,
        lookupByCoordinates,
        loading,
        error,
      }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation deve ser usado dentro de um LocationProvider');
  }
  return context;
};
