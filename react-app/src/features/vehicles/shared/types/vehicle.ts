import { Personnel } from "../../../dashboard/shared/types/personnel";

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
  user_id?: string;
  userId?: string;
  user?: Personnel;
}
