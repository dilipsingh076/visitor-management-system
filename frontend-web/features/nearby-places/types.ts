export interface NearbyPlace {
  place_id: string;
  name: string;
  address: string;
  category: string;
  lat: number | null;
  lng: number | null;
  distance_m: number | null;
  /** Set when the places API returns a phone (Ola nearby search currently does not). */
  phone?: string | null;
}

export interface PlaceCategory {
  id: string;
  label: string;
}

export interface NearbyPlacesResponse {
  places: NearbyPlace[];
  center: { lat: number; lng: number };
  radius: number;
}
