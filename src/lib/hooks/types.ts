export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface LocationData {
  coords: LocationCoords;
  timestamp: number;
}

export interface AddressData {
  display_name: string;
  formatted: string;
  place_id?: string;
  licence?: string;
  osm_type?: string;
  osm_id?: number;
  boundingbox?: string[];
  lat?: string;
  lon?: string;
  lng?: string;
  class?: string;
  type?: string;
  road?: string; // Rua/Avenida
  street?: string;
  number?: string;
  complement?: string;
  neighbourhood?: string; // Bairro
  suburb?: string; // Subúrbio
  city?: string; // Cidade
  town?: string; // Cidade pequena
  state?: string; // Estado
  state_district?: string; // Região administrativa
  country?: string; // País
  country_code?: string; // Código do país
  country_iso?: string;
  postcode?: string; // CEP
  house_number?: string; // Número
  road_number?: string; // Número da rua
  formatted_address?: string; // Endereço formatado pelo LocationIQ (backup)
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/** O que o mapa entrega ao tocar: igual ao MapPressEvent nativo, so o necessario. */
export interface MapPressEventLike {
  nativeEvent: { coordinate: { latitude: number; longitude: number } };
}

export interface MapComponentProps {
  region: Region | null;
  markerCoords: { latitude: number; longitude: number } | null;
  address?: AddressData;
  onMapPress: (event: MapPressEventLike) => void;
}
