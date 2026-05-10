import { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import UserMenu from './components/UserMenu';
import { authStore } from './store/authStore';

type View = 'login' | 'register';

export default function App() {
  const [isAuth, setIsAuth] = useState(() => authStore.isAuthenticated());
  const [view, setView] = useState<View>('login');

  useState(() => {
    return authStore.subscribe((user) => setIsAuth(user !== null));
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Auth App (standalone)</h1>

      {isAuth ? (
        <UserMenu />
      ) : view === 'login' ? (
        <LoginForm onSwitchToRegister={() => setView('register')} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setView('login')} />
      )}
    </div>
  );
}
