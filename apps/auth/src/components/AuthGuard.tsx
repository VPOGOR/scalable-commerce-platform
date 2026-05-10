import { useState, useEffect, type ReactNode } from 'react';
import { authStore } from '../store/authStore';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface Props {
  children: ReactNode;
}

type AuthView = 'login' | 'register';

export default function AuthGuard({ children }: Props) {
  const [isAuth, setIsAuth] = useState(() => authStore.isAuthenticated());
  const [view, setView] = useState<AuthView>('login');

  useEffect(() => {
    return authStore.subscribe((user) => setIsAuth(user !== null));
  }, []);

  if (!isAuth) {
    return view === 'login'
      ? <LoginForm onSwitchToRegister={() => setView('register')} />
      : <RegisterForm onSwitchToLogin={() => setView('login')} />;
  }

  return <>{children}</>;
}
