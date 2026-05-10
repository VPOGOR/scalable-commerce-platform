// ── catalog ──────────────────────────────────────────────────────────────────

declare module 'catalog/ProductCard' {
  import type { ComponentType } from 'react';
  import type { ProductSummary } from '@repo/types';
  const ProductCard: ComponentType<{ product: ProductSummary }>;
  export default ProductCard;
}

declare module 'catalog/ProductList' {
  import type { ComponentType } from 'react';
  import type { ProductSummary } from '@repo/types';
  const ProductList: ComponentType<{ products: ProductSummary[] }>;
  export default ProductList;
}

declare module 'catalog/Header' {
  import type { ComponentType } from 'react';
  const Header: ComponentType<{ text: string }>;
  export default Header;
}

// ── cart ─────────────────────────────────────────────────────────────────────

declare module 'cart/CartIcon' {
  import type { ComponentType } from 'react';
  const CartIcon: ComponentType<{ onOpen: () => void }>;
  export default CartIcon;
}

declare module 'cart/CartDrawer' {
  import type { ComponentType } from 'react';
  const CartDrawer: ComponentType<{ isOpen: boolean; onClose: () => void }>;
  export default CartDrawer;
}

declare module 'cart/CartSummary' {
  import type { ComponentType } from 'react';
  const CartSummary: ComponentType<Record<string, never>>;
  export default CartSummary;
}

// ── auth ─────────────────────────────────────────────────────────────────────

declare module 'auth/LoginForm' {
  import type { ComponentType } from 'react';
  const LoginForm: ComponentType<{ onSwitchToRegister?: () => void }>;
  export default LoginForm;
}

declare module 'auth/RegisterForm' {
  import type { ComponentType } from 'react';
  const RegisterForm: ComponentType<{ onSwitchToLogin?: () => void }>;
  export default RegisterForm;
}

declare module 'auth/AuthGuard' {
  import type { ComponentType, ReactNode } from 'react';
  const AuthGuard: ComponentType<{ children: ReactNode }>;
  export default AuthGuard;
}

declare module 'auth/UserMenu' {
  import type { ComponentType } from 'react';
  const UserMenu: ComponentType<Record<string, never>>;
  export default UserMenu;
}
