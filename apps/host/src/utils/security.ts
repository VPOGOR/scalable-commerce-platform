import { logger } from './logger';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'X-CSRF-Token';

// ─── CSRF ────────────────────────────────────────────────────────────────────
// Double-submit cookie pattern:
//   1. Client генерує токен → кладе в cookie (SameSite=Strict, не HttpOnly)
//   2. Клієнт надсилає той самий токен в X-CSRF-Token header
//   3. Сервер порівнює cookie і header — cross-site request не може прочитати cookie
//      тому не може виставити правильний header
// Захищає тільки cookie-based auth. Для Bearer токенів в Authorization header
// CSRF не актуальний (браузер не надсилає його автоматично).

function readCsrfCookie(): string | null {
  return (
    document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${CSRF_COOKIE}=`))
      ?.slice(CSRF_COOKIE.length + 1) ?? null
  );
}

function writeCsrfCookie(token: string): void {
  // SameSite=Strict — cookie не надсилається з cross-site запитів
  // НЕ HttpOnly — JS повинен мати змогу прочитати токен для header
  document.cookie = `${CSRF_COOKIE}=${token}; SameSite=Strict; path=/`;
}

export function getCsrfToken(): string {
  const existing = readCsrfCookie();
  if (existing) return existing;

  const token = crypto.randomUUID().replace(/-/g, '');
  writeCsrfCookie(token);
  logger.debug('CSRF token generated');
  return token;
}

export function getCsrfHeaders(): Record<string, string> {
  return { [CSRF_HEADER]: getCsrfToken() };
}

// ─── URL Sanitization ────────────────────────────────────────────────────────
// Захист від javascript: URL injection в href/src атрибутах
// (React екранує контент, але не URL схеми)

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      logger.warn('Blocked non-http URL', { url, protocol: parsed.protocol });
      return '/';
    }
    return url;
  } catch {
    return '/';
  }
}

// ─── Secure fetch wrapper ────────────────────────────────────────────────────
// Додає CSRF header до мутуючих запитів і логує помилки

export async function secureFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const method = (options.method ?? 'GET').toUpperCase();
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    ...(isMutating ? getCsrfHeaders() : {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'same-origin', // надсилати cookies тільки на same-origin
      headers,
    });

    if (!response.ok) {
      logger.warn('HTTP error response', { url, status: response.status, method });
    }

    return response;
  } catch (err) {
    logger.error('Network request failed', { url, method, error: String(err) });
    throw err;
  }
}
