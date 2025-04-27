// src/types/firestore.ts
export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  dateTime: string;
  isVerified: boolean;
  lat: number;
  lng: number;
  number: string;
  profile: string;
  sector: string;
  type: string;
}

export interface Personnel {
  id: string;
  sector: string;
  profile: string;
  phone_number: string;
  gender: string;
  email: string;
  isVerified: boolean;
  type: string;
  name: string;
  lat: number;
  dateTime: {
    seconds: number;
    nanoseconds: number;
  },
  address: string;
  lng: number;
  guardian_name: string;
  mark_number?: string;
  guardian_phone_number: string;
  last_location_update: string;
  birthday: string;
  isLoggedIn: boolean;
  vehicle?: Vehicle;
  username: string;
}

export interface Vehicle {
  id: string;
  datetime: string;
  lat: number;
  long: number;
  lng?: number;
  latitude?: number;
  model: string;
  color: string;
  plate_number: string;
  platenumber?: string;
  user_id?:string;
  userId?: string;
  user?: Personnel;
}

export interface Activity {
  id: string;
  user: Personnel;
  user_id: string;
  vehicle_id?: string;
  vehicle?: Vehicle;
  status: string;
  entry_time?: string; // This is date time
  exit_time?: string; // This is date time
  date_time: string;
  hours_in?: string | number;
  lng: string;
  lat: string;
}

export interface FirestoreResponse<T> {
  data: T | null;
  error: string | null;
}