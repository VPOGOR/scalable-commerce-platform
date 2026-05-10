import { useState } from 'react';
import CartIcon from './components/CartIcon';
import CartDrawer from './components/CartDrawer';
import CartSummary from './components/CartSummary';

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Cart App (standalone)</h1>
      <CartIcon onOpen={() => setIsOpen(true)} />
      <CartSummary />
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
