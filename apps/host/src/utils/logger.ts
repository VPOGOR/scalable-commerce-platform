type Level = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: Level;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const COLORS: Record<Level, string> = {
  debug: '#888888',
  info: '#0070f3',
  warn: '#f5a623',
  error: '#e00000',
};

function log(level: Level, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  if (import.meta.env.DEV) {
    // Кольоровий вивід у dev — читабельно для розробника
    console.log(
      `%c[${level.toUpperCase()}] %c${message}`,
      `color: ${COLORS[level]}; font-weight: bold`,
      'color: inherit',
      context ?? '',
    );
  } else {
    // JSON формат у production — для збору логів ELK Stack / Kibana
    // Kibana парсить JSON-рядки і будує searchable fields
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
};
