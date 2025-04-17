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
  number: string;
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
  lng: number
}

export interface FirestoreResponse<T> {
  data: T | null;
  error: string | null;
}