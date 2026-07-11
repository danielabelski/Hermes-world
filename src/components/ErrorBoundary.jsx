import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          maxWidth: '800px',
          margin: '0 auto',
          fontFamily: 'var(--font-main, sans-serif)',
          color: 'var(--text-primary, #fff)',
          background: 'var(--bg-main, #0f1115)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h1 style={{ color: 'var(--error, #ef4444)', marginBottom: '10px' }}>⚠️ Wystąpił krytyczny błąd interfejsu</h1>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', marginBottom: '20px', lineHeight: '1.6' }}>
            Aplikacja napotkała nieoczekiwany problem z renderowaniem, ale samo środowisko nadal działa w tle. <br/>
            Nie martw się, to tylko błąd widoku (Frontend).
          </p>
          
          <div style={{
            background: 'var(--bg-panel, #1e2128)',
            border: '1px solid var(--border-color, #334155)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px',
            overflowX: 'auto'
          }}>
            <h3 style={{ marginTop: 0, color: 'var(--accent-orange, #f97316)' }}>Szczegóły błędu:</h3>
            <pre style={{ 
              fontFamily: 'var(--font-mono, monospace)', 
              fontSize: '13px', 
              color: 'var(--error, #ef4444)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {this.state.error && this.state.error.toString()}
            </pre>
            {this.state.errorInfo && (
              <details style={{ marginTop: '15px', color: 'var(--text-muted, #64748b)' }}>
                <summary style={{ cursor: 'pointer', outline: 'none' }}>Pokaż stos wywołań (Stack Trace)</summary>
                <pre style={{ 
                  marginTop: '10px', 
                  fontSize: '11px', 
                  whiteSpace: 'pre-wrap',
                  borderLeft: '2px solid var(--border-color, #334155)',
                  paddingLeft: '10px'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: 'var(--accent-orange, #f97316)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              transition: 'opacity 0.2s'
            }}
          >
            Odśwież aplikację
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
