import { Component, type ReactNode, type ErrorInfo } from 'react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Логуємо в structured форматі — в prod це піде в ELK/Kibana
    logger.error(`ErrorBoundary [${this.props.name ?? 'unknown'}] caught error`, {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack ?? undefined,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          padding: '20px', margin: '16px',
          border: '1px solid #f5c6cb', borderRadius: '8px',
          background: '#fff5f5', color: '#721c24',
        }}>
          <strong>Something went wrong</strong>
          {import.meta.env.DEV && (
            <pre style={{ marginTop: '8px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              {this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
