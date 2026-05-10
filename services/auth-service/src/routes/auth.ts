import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse, LoginCredentials, RegisterPayload, AuthUser, User } from '@repo/types';
import { signJwt, verifyJwt } from '../utils/jwt.js';
import { csrfProtection } from '../middleware/csrf.js';

export const authRouter = Router();

const IS_PROD = process.env['NODE_ENV'] === 'production';
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 днів
const ACCESS_TOKEN_TTL = 60 * 60 * 1000;            // 1 година

function makeUser(id: string, email: string, firstName: string, lastName: string): User {
  return {
    id,
    email,
    firstName,
    lastName,
    role: 'customer',
    avatarUrl: null,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
  };
}

function ok<T>(res: Response, data: T, status = 200): void {
  const body: ApiResponse<T> = { data, success: true, error: null, timestamp: new Date().toISOString() };
  res.status(status).json(body);
}

function fail(res: Response, code: string, message: string, status = 400): void {
  const body: ApiResponse<null> = { data: null, success: false, error: { code, message }, timestamp: new Date().toISOString() };
  res.status(status).json(body);
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refresh_token', token, {
    httpOnly: true,        // JS не може читати — захист від XSS
    secure: IS_PROD,       // HTTPS only в production
    sameSite: 'strict',    // не надсилається з cross-site запитів — захист від CSRF
    maxAge: REFRESH_TOKEN_TTL,
    path: '/auth/refresh', // cookie доступний тільки на цьому шляху
  });
}

// POST /auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body as LoginCredentials;

  if (!email || !password || password.length < 6) {
    fail(res, 'INVALID_CREDENTIALS', 'Email and password (min 6 chars) are required');
    return;
  }

  const userId = crypto.randomUUID();
  const user = makeUser(userId, email, email.split('@')[0] ?? 'User', '');
  const accessToken = signJwt(userId, email, 'customer', ACCESS_TOKEN_TTL);
  const refreshToken = signJwt(userId, email, 'customer', REFRESH_TOKEN_TTL);

  setRefreshCookie(res, refreshToken);

  const authUser: AuthUser = {
    user,
    accessToken,
    refreshToken: '[httponly-cookie]', // не надсилаємо refreshToken в body
    expiresAt: Date.now() + ACCESS_TOKEN_TTL,
  };

  ok(res, authUser);
});

// POST /auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body as RegisterPayload;

  if (!email || !password || password.length < 6 || !firstName) {
    fail(res, 'INVALID_PAYLOAD', 'email, password (min 6), firstName are required');
    return;
  }

  const userId = crypto.randomUUID();
  const user = makeUser(userId, email, firstName, lastName ?? '');
  const accessToken = signJwt(userId, email, 'customer', ACCESS_TOKEN_TTL);
  const refreshToken = signJwt(userId, email, 'customer', REFRESH_TOKEN_TTL);

  setRefreshCookie(res, refreshToken);

  const authUser: AuthUser = {
    user,
    accessToken,
    refreshToken: '[httponly-cookie]',
    expiresAt: Date.now() + ACCESS_TOKEN_TTL,
  };

  ok(res, authUser, 201);
});

// POST /auth/refresh — читає HttpOnly cookie, видає новий accessToken
// SameSite=Strict на cookie є достатнім CSRF захистом для цього endpoint
authRouter.post('/refresh', (req: Request, res: Response) => {
  const cookies = req.cookies as Record<string, string | undefined>;
  const refreshToken = cookies['refresh_token'];

  if (!refreshToken) {
    fail(res, 'NO_REFRESH_TOKEN', 'Refresh token cookie not found', 401);
    return;
  }

  const payload = verifyJwt(refreshToken);
  if (!payload) {
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    fail(res, 'INVALID_REFRESH_TOKEN', 'Refresh token expired or invalid', 401);
    return;
  }

  const newAccessToken = signJwt(payload.sub, payload.email, payload.role, ACCESS_TOKEN_TTL);
  ok(res, { accessToken: newAccessToken, expiresAt: Date.now() + ACCESS_TOKEN_TTL });
});

// POST /auth/logout — CSRF захищений (authenticated mutation)
authRouter.post('/logout', csrfProtection, (req: Request, res: Response) => {
  // Видаляємо HttpOnly cookie на стороні сервера
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    path: '/auth/refresh',
  });
  ok(res, { message: 'Logged out successfully' });
});

// GET /auth/me — валідує Bearer token з Authorization header
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    fail(res, 'UNAUTHORIZED', 'Authorization header required', 401);
    return;
  }

  const payload = verifyJwt(token);
  if (!payload) {
    fail(res, 'INVALID_TOKEN', 'Token expired or invalid', 401);
    return;
  }

  ok(res, { sub: payload.sub, email: payload.email, role: payload.role });
});
