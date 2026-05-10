import { useState, useEffect } from 'react';
import type { AuthUser } from '@repo/types';
import { authStore } from '../store/authStore';

export default function UserMenu() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => authStore.getUser());

  useEffect(() => {
    return authStore.subscribe(setAuthUser);
  }, []);

  if (!authUser) return null;

  const nameInitials = [authUser.user.firstName[0], authUser.user.lastName[0]]
    .filter(Boolean).join('').toUpperCase();
  const initials = nameInitials || (authUser.user.email[0]?.toUpperCase() ?? '?');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: '#111', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 600,
      }}>
        {initials}
      </div>
      <span style={{ fontSize: '14px', color: '#333' }}>{authUser.user.email}</span>
      <button
        onClick={() => authStore.logout()}
        style={{ padding: '5px 12px', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', background: '#fff', fontSize: '13px' }}
      >
        Logout
      </button>
    </div>
  );
}
