import type { AuthUser, LoginCredentials, RegisterPayload, User } from '@repo/types';

// ─── Security model ───────────────────────────────────────────────────────────
//
// ПОТОЧНА РЕАЛІЗАЦІЯ (demo/dev):
//   Вся AuthUser структура зберігається в localStorage для persistence між сесіями.
//   Це зручно для розробки, але вразливо до XSS атак.
//
// PRODUCTION ПІДХІД:
//   accessToken  → тільки в пам'яті (in-memory variable).
//                  Втрачається при refresh — OK для short-lived токенів (15-60хв).
//   refreshToken → HttpOnly cookie (встановлюється сервером через Set-Cookie header).
//                  JavaScript не може читати HttpOnly cookies → XSS захист.
//   user data    → можна в localStorage (не секретне, не токен).
//
//   Refresh flow:
//     1. accessToken протермінований → silent refresh через /api/auth/refresh
//     2. Сервер читає refreshToken з HttpOnly cookie → видає новий accessToken
//     3. Новий accessToken зберігається в пам'яті
//
// ─────────────────────────────────────────────────────────────────────────────

type Subscriber = (user: AuthUser | null) => void;

const STORAGE_KEY = 'auth:session';

function loadFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (parsed.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function makeMockToken(): string {
  // Production: real JWT підписаний RS256 приватним ключем на сервері
  return btoa(`mock.${crypto.randomUUID()}.${Date.now()}`);
}

function makeUser(email: string, firstName: string, lastName: string): User {
  return {
    id: crypto.randomUUID(),
    email,
    firstName,
    lastName,
    role: 'customer',
    avatarUrl: null,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
  };
}

let current: AuthUser | null = loadFromStorage();
const subscribers = new Set<Subscriber>();

function notify(): void {
  subscribers.forEach((fn) => fn(current));
  window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: current } }));
}

function buildAuthUser(user: User): AuthUser {
  return {
    user,
    accessToken: makeMockToken(),
    refreshToken: makeMockToken(),
    expiresAt: Date.now() + 3_600_000, // 1 година
  };
}

function persistSession(authUser: AuthUser): void {
  // Demo: зберігаємо все. Production: зберігати тільки user + expiresAt, не токени.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
}

export const authStore = {
  getUser(): AuthUser | null {
    return current;
  },

  // Повертає accessToken з пам'яті (не з localStorage) — production-ready pattern
  getAccessToken(): string | null {
    return current?.accessToken ?? null;
  },

  isAuthenticated(): boolean {
    return current !== null && current.expiresAt > Date.now();
  },

  async login(credentials: LoginCredentials): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 500));
    const firstName = credentials.email.split('@')[0] ?? 'User';
    current = buildAuthUser(makeUser(credentials.email, firstName, ''));
    persistSession(current);
    notify();
  },

  async register(payload: RegisterPayload): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 500));
    current = buildAuthUser(makeUser(payload.email, payload.firstName, payload.lastName));
    persistSession(current);
    notify();
  },

  logout(): void {
    current = null;
    localStorage.removeItem(STORAGE_KEY);
    // Production: також викликати POST /api/auth/logout → сервер очистить HttpOnly cookie
    notify();
  },

  subscribe(fn: Subscriber): () => void {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
};
