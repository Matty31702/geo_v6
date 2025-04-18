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
  guardian_phone_number: string;
  birthday: string;
}

export interface Vehicle {
  id: string;
  datetime: string;
  lat: number;
  long: number;
  model: string;
  color: string;
  plate_number: string;
  user_id:string
}

export interface FirestoreResponse<T> {
  data: T | null;
  error: string | null;
}