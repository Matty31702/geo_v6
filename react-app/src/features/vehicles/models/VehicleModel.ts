import { Personnel } from "../../personnels/api/models";

export class Vehicle {
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
  user_id?: string;
  userId?: string;
  user?: Personnel;

  constructor(data: {
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
    user_id?: string;
    userId?: string;
    user?: Personnel;
  }) {
    this.id = data.id;
    this.datetime = data.datetime;
    this.lat = data.lat;
    this.long = data.long;
    this.lng = data.lng;
    this.latitude = data.latitude;
    this.model = data.model;
    this.color = data.color;
    this.plate_number = data.plate_number;
    this.platenumber = data.platenumber;
    this.user_id = data.user_id;
    this.userId = data.userId;
    this.user = data.user;
  }
}
