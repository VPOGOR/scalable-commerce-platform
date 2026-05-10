import type { Request, Response, NextFunction } from 'express';

// JSON-формат логів → легко парситься ELK Stack / Kibana
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const entry = {
      level: res.statusCode >= 400 ? 'warn' : 'info',
      message: 'HTTP request',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
    console.log(JSON.stringify(entry));
  });

  next();
}
