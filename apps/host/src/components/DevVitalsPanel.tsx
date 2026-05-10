import { useState, useEffect } from 'react';
import { subscribeToVitals, THRESHOLDS, type VitalMetric, type VitalRating } from '../utils/vitals';

const RATING_COLOR: Record<VitalRating, string> = {
  good: '#00c853',
  'needs-improvement': '#ffab00',
  poor: '#d50000',
};

const RATING_LABEL: Record<VitalRating, string> = {
  good: '✓',
  'needs-improvement': '!',
  poor: '✗',
};

const DESCRIPTIONS: Record<string, string> = {
  LCP: 'Largest Contentful Paint',
  CLS: 'Cumulative Layout Shift',
  TTFB: 'Time to First Byte',
  INP: 'Interaction to Next Paint',
  FCP: 'First Contentful Paint',
};

function formatValue(name: string, value: number): string {
  if (name === 'CLS') return value.toFixed(4);
  return `${Math.round(value)}ms`;
}

function VitalRow({ metric }: { metric: VitalMetric }) {
  const color = RATING_COLOR[metric.rating];
  const [good, poor] = THRESHOLDS[metric.name] ?? [0, 0];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <span style={{
        width: '18px', height: '18px', borderRadius: '50%',
        background: color, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: '#fff', flexShrink: 0,
      }}>
        {RATING_LABEL[metric.rating]}
      </span>
      <span style={{ fontSize: '11px', color: '#ccc', width: '38px', flexShrink: 0 }}>{metric.name}</span>
      <span style={{ fontSize: '12px', fontWeight: 600, color, minWidth: '60px' }}>
        {formatValue(metric.name, metric.value)}
      </span>
      <span style={{ fontSize: '10px', color: '#666' }}>
        &lt;{formatValue(metric.name, good)} / &lt;{formatValue(metric.name, poor)}
      </span>
    </div>
  );
}

export default function DevVitalsPanel() {
  const [vitals, setVitals] = useState<Record<string, VitalMetric>>({});
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    return subscribeToVitals(setVitals);
  }, []);

  const metricList = Object.values(vitals);
  const hasData = metricList.length > 0;

  return (
    <div style={{
      position: 'fixed', bottom: '16px', right: '16px',
      background: 'rgba(15,15,15,0.92)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
      padding: collapsed ? '8px 12px' : '12px 14px',
      zIndex: 9999, minWidth: collapsed ? 'auto' : '260px',
      fontFamily: 'monospace', boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    }}>
      <div
        onClick={() => setCollapsed((c) => !c)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ fontSize: '12px', color: '#0070f3', fontWeight: 700 }}>⚡ Web Vitals</span>
        {hasData && collapsed && (
          <span style={{ fontSize: '11px', color: '#888' }}>{metricList.length} metrics</span>
        )}
        <span style={{ marginLeft: 'auto', color: '#666', fontSize: '11px' }}>{collapsed ? '▲' : '▼'}</span>
      </div>

      {!collapsed && (
        <div style={{ marginTop: '8px' }}>
          {!hasData ? (
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Waiting for metrics…</p>
          ) : (
            metricList.map((m) => <VitalRow key={m.name} metric={m} />)
          )}
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#555', lineHeight: 1.4 }}>
            {Object.entries(DESCRIPTIONS).map(([k, v]) => (
              <div key={k}><span style={{ color: '#888' }}>{k}</span> — {v}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
