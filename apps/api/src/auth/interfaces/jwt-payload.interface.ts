export enum UserRole {
  Owner = 'owner',
  Lead = 'lead',
  Viewer = 'viewer'
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}
