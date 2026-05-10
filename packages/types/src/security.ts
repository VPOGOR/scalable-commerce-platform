export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface CsrfToken {
  token: string;
  expiresAt: number;
}

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security'?: string;
}

export interface SecureRequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  withCsrf?: boolean;
  credentials?: RequestCredentials;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
