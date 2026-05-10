export type UserRole = 'guest' | 'customer' | 'admin' | 'moderator';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthUser {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  firstName: string;
  lastName: string;
}
