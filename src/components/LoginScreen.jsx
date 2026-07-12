import { useState } from 'react';
import './LoginScreen.css';

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
    <main className="citadel-login">
      <section className="citadel-login__panel" aria-labelledby="citadel-login-title">
        <img className="citadel-login__mark" src="/citadel-mark.svg" alt="" />
        <div className="citadel-login__eyebrow">Ambient Agent Observatory</div>
        <h1 id="citadel-login-title">Hermes Citadel</h1>
        <p className="citadel-login__subtitle">Wejdź do centrum dowodzenia agentów</p>

        <form onSubmit={handleLogin} className="citadel-login__form">
          <label>
            Klucz dostępu
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Wpisz frazę autoryzacyjną"
              autoComplete="current-password"
              autoFocus
            />
          </label>

          {error && <div className="citadel-login__error" role="alert">{error}</div>}

          <button type="submit" disabled={loading || !password}>
            {loading ? 'OTWIERANIE BRAMY…' : 'WEJDŹ DO CYTADELI'}
          </button>
        </form>
        <div className="citadel-login__status">Bezpieczne połączenie z Hermes OS</div>
      </section>
    </main>
  );
}
