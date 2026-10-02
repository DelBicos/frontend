import { create } from 'zustand';
import { AddressData, LocationStore } from './types';

const LOCATIONIQ_API_KEY = process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY || '';

if (!LOCATIONIQ_API_KEY) {
  console.warn(
    '⚠️ A chave da API LocationIQ não está definida no arquivo .env (EXPO_PUBLIC_LOCATIONIQ_API_KEY)',
  );
}

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

async function lookupByQuery(query: string): Promise<AddressData | null> {
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
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  address: null,
  city: undefined,
  state: undefined,
  loading: false,
  error: null,

  setLocation: async (city: string, state: string) => {
    set({ loading: true, error: null });

    try {
      const foundAddress = await lookupByQuery(`${city}, ${state}, Brazil`);

      if (foundAddress) {
        set({
          address: foundAddress,
          city: foundAddress.city,
          state: foundAddress.state,
        });
      } else {
        console.warn(
          `Não foi possível encontrar coordenadas para ${city}, ${state}`,
        );
        set({
          address: {
            ...get().address,
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
          } as AddressData,
          city,
          state,
        });
      }
    } catch {
      set({ error: 'Erro ao definir localização.' });
    } finally {
      set({ loading: false });
    }
  },

  lookupByCoordinates: async (latitude: number, longitude: number) => {
    if (!LOCATIONIQ_API_KEY) {
      const errorMessage =
        'Chave da API LocationIQ não configurada (EXPO_PUBLIC_LOCATIONIQ_API_KEY)';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }

    set({ error: null, loading: true });

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

      set({
        address: addressData,
        city: addressData.city,
        state: addressData.state,
      });
    } catch (err: any) {
      const errorMessage =
        err?.message ?? 'Erro desconhecido no reverse geocoding';
      console.error('❌ Erro no geocoding:', errorMessage);
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
}));
