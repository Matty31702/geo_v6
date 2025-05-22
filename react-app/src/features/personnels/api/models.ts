import { Vehicle } from "../../vehicles/models/VehicleModel";

export class Personnel {
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

  constructor(data: {
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
  }) {
    this.id = data.id;
    this.sector = data.sector;
    this.profile = data.profile;
    this.phone_number = data.phone_number;
    this.gender = data.gender;
    this.email = data.email;
    this.isVerified = data.isVerified;
    this.type = data.type;
    this.name = data.name;
    this.lat = data.lat;
    this.dateTime = data.dateTime;
    this.address = data.address;
    this.lng = data.lng;
    this.guardian_name = data.guardian_name;
    this.mark_number = data.mark_number;
    this.guardian_phone_number = data.guardian_phone_number;
    this.last_location_update = data.last_location_update;
    this.birthday = data.birthday;
    this.isLoggedIn = data.isLoggedIn;
    this.vehicle = data.vehicle;
    this.username = data.username;
  }
}
