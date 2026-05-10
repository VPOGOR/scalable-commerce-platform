import { useState } from 'react';
import type { RegisterPayload } from '@repo/types';
import { authStore } from '../store/authStore';

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '9px 12px',
  marginTop: '4px', border: '1px solid #ccc', borderRadius: '6px',
  fontSize: '14px', boxSizing: 'border-box',
};

interface Props {
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: Props) {
  const [payload, setPayload] = useState<RegisterPayload>({
    email: '', password: '', firstName: '', lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authStore.register(payload);
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof RegisterPayload) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setPayload((prev) => ({ ...prev, [field]: e.target.value }));
  }

  return (
    <div style={{ maxWidth: '360px', margin: '40px auto', padding: '32px', border: '1px solid #eee', borderRadius: '12px' }}>
      <h2 style={{ margin: '0 0 24px', textAlign: 'center' }}>Create Account</h2>

      {error && (
        <div style={{ color: '#c00', background: '#fff0f0', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>First Name</label>
            <input
              type="text" required
              value={payload.firstName} onChange={updateField('firstName')}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Last Name</label>
            <input
              type="text" required
              value={payload.lastName} onChange={updateField('lastName')}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Email</label>
          <input
            type="email" required autoComplete="email"
            value={payload.email} onChange={updateField('email')}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Password</label>
          <input
            type="password" required minLength={6} autoComplete="new-password"
            value={payload.password} onChange={updateField('password')}
            style={inputStyle}
          />
          <span style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>
            Minimum 6 characters
          </span>
        </div>

        <button
          type="submit" disabled={loading}
          style={{ width: '100%', padding: '11px', background: loading ? '#666' : '#111', color: '#fff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px' }}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      {onSwitchToLogin && (
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }}>
            Sign In
          </button>
        </p>
      )}
    </div>
  );
}
