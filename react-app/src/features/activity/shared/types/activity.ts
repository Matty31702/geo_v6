import { Personnel } from "../../../dashboard/shared/types/personnel";
import { Vehicle } from "../../../vehicles/shared/types/vehicle";

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
