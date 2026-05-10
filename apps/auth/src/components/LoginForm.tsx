import { useState } from 'react';
import type { LoginCredentials } from '@repo/types';
import { authStore } from '../store/authStore';

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '9px 12px',
  marginTop: '4px', border: '1px solid #ccc', borderRadius: '6px',
  fontSize: '14px', boxSizing: 'border-box',
};

interface Props {
  onSwitchToRegister?: () => void;
}

export default function LoginForm({ onSwitchToRegister }: Props) {
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authStore.login(credentials);
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof LoginCredentials) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setCredentials((prev) => ({ ...prev, [field]: e.target.value }));
  }

  return (
    <div style={{ maxWidth: '360px', margin: '40px auto', padding: '32px', border: '1px solid #eee', borderRadius: '12px' }}>
      <h2 style={{ margin: '0 0 24px', textAlign: 'center' }}>Sign In</h2>

      {error && (
        <div style={{ color: '#c00', background: '#fff0f0', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Email</label>
          <input
            type="email" required autoComplete="email"
            value={credentials.email} onChange={updateField('email')}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Password</label>
          <input
            type="password" required minLength={6} autoComplete="current-password"
            value={credentials.password} onChange={updateField('password')}
            style={inputStyle}
          />
        </div>

        <button
          type="submit" disabled={loading}
          style={{ width: '100%', padding: '11px', background: loading ? '#666' : '#111', color: '#fff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px' }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {onSwitchToRegister && (
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          No account?{' '}
          <button onClick={onSwitchToRegister} style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }}>
            Register
          </button>
        </p>
      )}
    </div>
  );
}
