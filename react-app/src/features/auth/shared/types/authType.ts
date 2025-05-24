export interface LoginCredentials {
  userId: string;
  password: string;
}

export interface LoginErrorResponse {
  email?: string;
  password?: string;
  other?: string;
}

export interface LoginValidationErrors {
  email?: string;
  password?: string;
}

export interface CustomUser {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  type: "Personnel" | "admin" | "superadmin";
}
