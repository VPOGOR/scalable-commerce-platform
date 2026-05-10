import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { requestLogger } from './middleware/requestLogger.js';
import { productsRouter } from './routes/products.js';

const app = express();
const PORT = process.env['PORT'] ?? '4001';

app.use(corsMiddleware);
app.use(express.json());
app.use(requestLogger);

app.use('/products', productsRouter);

// Health check — використовується docker-compose і load balancer
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'product-service',
    timestamp: new Date().toISOString(),
  });
});

// Prometheus-compatible metrics endpoint (спрощена версія)
app.get('/metrics', (_req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send([
    '# HELP product_service_up Service availability',
    '# TYPE product_service_up gauge',
    'product_service_up 1',
    `# HELP process_uptime_seconds Process uptime`,
    `# TYPE process_uptime_seconds gauge`,
    `process_uptime_seconds ${process.uptime().toFixed(2)}`,
  ].join('\n'));
});

app.listen(PORT, () => {
  console.log(JSON.stringify({
    level: 'info',
    message: 'product-service started',
    port: PORT,
    timestamp: new Date().toISOString(),
  }));
});
