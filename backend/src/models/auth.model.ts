export interface LoginRequest {
  username: string;
  password: string;
}

/** The logged-in staff member, as exposed to the client and to controllers. */
export interface AuthUser {
  userId: string;
  userName: string;
  username: string;
}
