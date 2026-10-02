export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapComponentProps {
  region: Region | null;
  markerCoords: { latitude: number; longitude: number } | null;
  formattedAddress?: string;
  onMapPress: (event: any) => void;
}
