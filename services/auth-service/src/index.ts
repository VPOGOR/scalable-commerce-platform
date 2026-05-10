import express from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middleware/cors.js';
import { authRouter } from './routes/auth.js';

const app = express();
const PORT = process.env['PORT'] ?? '4002';

app.use(corsMiddleware);
app.use(express.json());
// cookie-parser читає HttpOnly cookie з запиту — потрібен для /auth/refresh
app.use(cookieParser());

app.use('/auth', authRouter);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
});

// Prometheus metrics
app.get('/metrics', (_req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send([
    '# HELP auth_service_up Service availability',
    '# TYPE auth_service_up gauge',
    'auth_service_up 1',
    `# HELP process_uptime_seconds Process uptime`,
    `# TYPE process_uptime_seconds gauge`,
    `process_uptime_seconds ${process.uptime().toFixed(2)}`,
  ].join('\n'));
});

app.listen(PORT, () => {
  console.log(JSON.stringify({
    level: 'info',
    message: 'auth-service started',
    port: PORT,
    timestamp: new Date().toISOString(),
  }));
});
