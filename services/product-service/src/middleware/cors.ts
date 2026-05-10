import cors from 'cors';

// Explicitly allowlist FE origins — не використовувати '*' для credentialed запитів
const ALLOWED_ORIGINS = [
  'http://localhost:3001', // host
  'http://localhost:3002', // catalog MFE
  'http://localhost:3003', // cart MFE
  'http://localhost:3004', // auth MFE
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Дозволяємо запити без origin (curl, Postman, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true, // потрібно для cookie-based auth
});
