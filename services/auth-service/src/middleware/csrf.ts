import type { Request, Response, NextFunction } from 'express';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf_token';

// Double-submit cookie validation:
// Браузер автоматично надсилає cookie, але cross-site JS не може прочитати його
// і тому не може виставити правильний X-CSRF-Token header
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const headerToken = req.headers[CSRF_HEADER];
  const cookieToken = (req.cookies as Record<string, string | undefined>)[CSRF_COOKIE];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({
      data: null,
      success: false,
      error: {
        code: 'CSRF_VALIDATION_FAILED',
        message: 'Invalid or missing CSRF token',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
}
