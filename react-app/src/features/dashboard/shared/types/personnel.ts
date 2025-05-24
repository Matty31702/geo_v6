import { Vehicle } from "../../../vehicles/shared/types/vehicle";

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
  };
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
  created_at?: string | any;
}

export interface PersonnelErrorResponse {
  other?: string;
}

export interface PersonnelFormDataProps {
  name: string;
  username: string;
  phone_number: string;
  mark_number: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  type: string;
  gender: string;
  guardian_name: string;
  guardian_phone_number: string;
  birthday: string;
}

export interface PersonnelEditFormDataProps {
  id: Personnel["id"];
  name: Personnel["name"];
  phone_number: Personnel["phone_number"];
  gender: Personnel["gender"];
  birthday: Personnel["birthday"];
  address: Personnel["address"];
  guardian_name: Personnel["guardian_name"];
  guardian_phone_number: Personnel["guardian_phone_number"];
}
