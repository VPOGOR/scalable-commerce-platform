import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { logger } from './logger';

export type VitalRating = 'good' | 'needs-improvement' | 'poor';

export interface VitalMetric {
  name: string;
  value: number;
  rating: VitalRating;
}

// Core Web Vitals thresholds (Google 2024)
export const THRESHOLDS: Record<string, [number, number]> = {
  LCP:  [2500, 4000],   // ms — Largest Contentful Paint
  CLS:  [0.1,  0.25],   // score — Cumulative Layout Shift
  TTFB: [800,  1800],   // ms — Time to First Byte
  INP:  [200,  500],    // ms — Interaction to Next Paint
  FCP:  [1800, 3000],   // ms — First Contentful Paint
};

type VitalsSubscriber = (vitals: Record<string, VitalMetric>) => void;

const store: Record<string, VitalMetric> = {};
const subscribers = new Set<VitalsSubscriber>();

export function subscribeToVitals(fn: VitalsSubscriber): () => void {
  subscribers.add(fn);
  fn({ ...store });
  return () => subscribers.delete(fn);
}

function notify(): void {
  const snapshot = { ...store };
  subscribers.forEach((fn) => fn(snapshot));
}

function handleMetric(metric: Metric): void {
  const vital: VitalMetric = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
  };

  store[metric.name] = vital;

  logger.info(`Web Vital: ${metric.name}`, {
    value: metric.value.toFixed(metric.name === 'CLS' ? 4 : 0),
    rating: metric.rating,
  });

  notify();

  // Production: надсилати в analytics endpoint або metrics aggregator
  if (!import.meta.env.DEV) {
    sendToAnalytics(vital);
  }
}

function sendToAnalytics(vital: VitalMetric): void {
  // Beacon API — не блокує сторінку, надійний навіть при закритті вкладки
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics/vitals', JSON.stringify(vital));
  }
}

export function initVitals(): void {
  onLCP(handleMetric);
  onCLS(handleMetric);
  onTTFB(handleMetric);
  onINP(handleMetric);
  onFCP(handleMetric);

  logger.info('Web Vitals monitoring initialized');
}
