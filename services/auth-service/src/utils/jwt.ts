import { createHmac } from 'crypto';

// Production: винести в AWS Secrets Manager / Vault, ротувати регулярно
const SECRET = process.env['JWT_SECRET'] ?? 'dev-secret-change-before-production';

if (process.env['NODE_ENV'] === 'production' && !process.env['JWT_SECRET']) {
  console.error(JSON.stringify({
    level: 'error',
    message: 'JWT_SECRET env var not set — using insecure default!',
  }));
}

function base64url(input: string): string {
  return Buffer.from(input).toString('base64url');
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

// Мінімальна JWT реалізація (HMAC-SHA256 = HS256)
// Production: використовувати RS256 з ротованими ключами (asymmetric)
export function signJwt(sub: string, email: string, role: string, expiresInMs = 3_600_000): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    sub,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + expiresInMs) / 1000),
  }));
  const signature = createHmac('sha256', SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    const header = parts[0];
    const payload = parts[1];
    const signature = parts[2];

    if (!header || !payload || !signature) return null;

    const expected = createHmac('sha256', SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    // Constant-time comparison — захист від timing attacks
    if (signature.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < signature.length; i++) {
      diff |= (signature.charCodeAt(i) ^ expected.charCodeAt(i));
    }
    if (diff !== 0) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as JwtPayload;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;

    return decoded;
  } catch {
    return null;
  }
}
