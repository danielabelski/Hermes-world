import { useState } from 'react';
import HermesMascot from './HermesMascot';

export default function LoginScreen({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        onLoginSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Nieprawidlowe haslo');
      }
    } catch {
      setError('Blad polaczenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-panel">
        <div className="login-mascot">
          <HermesMascot state="online" size={88} />
        </div>
        <div className="login-kicker">&gt;_ SECURE OPERATOR ACCESS</div>
        <h1>HERMES_OS</h1>
        <p>Agent Mission Control</p>

        <form onSubmit={handleLogin} className="login-form">
          <label>
            ACCESS KEY
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter authorization phrase..."
              autoFocus
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={loading || !password}>
            {loading ? 'AUTHORIZING...' : 'ENTER SYSTEM'}
          </button>
        </form>
      </div>
    </div>
  );
}
