import { LatLngTuple } from "leaflet";

export interface GeofencePolygon {
  name: string;
  coordinates: LatLngTuple[];
}

export interface GeofenceCenter {
  lat: number;
  lng: number;
}

export interface Marker {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface PoliceHQ {
  name: string;
  address: string;
  lat: number;
  lng: number;
}
