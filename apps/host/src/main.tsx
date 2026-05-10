import ReactDOM from 'react-dom/client';
import App from './App';
import { initVitals } from './utils/vitals';
import { logger } from './utils/logger';

// Запускаємо збір Web Vitals одразу при старті
initVitals();

logger.info('Host app starting', {
  env: import.meta.env.MODE,
  version: import.meta.env.VITE_APP_VERSION ?? 'dev',
});

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
