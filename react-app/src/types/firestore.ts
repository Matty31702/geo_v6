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

export interface FirestoreResponse<T> {
  data: T | null;
  error: string | null;
}