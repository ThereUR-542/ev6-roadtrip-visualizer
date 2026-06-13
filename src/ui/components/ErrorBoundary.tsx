import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Top-level error boundary (PLE-47).
 *
 * The blank-shell fire taught us that a render throw on a client-rendered SPA
 * leaves an empty #root with no signal to the user. This boundary guarantees
 * that any future render error surfaces a visible, styled fallback (and a
 * console stack trace) instead of a silent blank page — so a regression is
 * obvious in the browser, not invisible.
 */
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Make the failure loud in production telemetry / console.
    console.error('App render crashed:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          color: '#e8eefc',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 560,
            padding: '24px 28px',
            borderRadius: 16,
            background: 'rgba(20,28,52,0.85)',
            border: '1px solid rgba(150,175,235,0.25)',
          }}
        >
          <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>Something went wrong</h1>
          <p style={{ margin: '0 0 12px', color: '#9fb0d4', fontSize: 14, lineHeight: 1.5 }}>
            The visualizer hit an unexpected error while rendering. Try reloading the page. If it
            persists, the details below help us fix it.
          </p>
          <pre
            style={{
              margin: 0,
              padding: 12,
              borderRadius: 10,
              background: '#0a0f1c',
              color: '#ff9b9b',
              fontSize: 12,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {error.message}
          </pre>
        </div>
      </div>
    );
  }
}
