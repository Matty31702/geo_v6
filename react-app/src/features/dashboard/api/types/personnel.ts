import { Vehicle } from "./vehicle";

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

export interface CreatePersonnel {
  name: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  address: string;
  guardian_name: string;
  guardian_phone_number: string;
  mark_number: string;
  gender: string;
  type: "Personnel";
  birthday: string;
}