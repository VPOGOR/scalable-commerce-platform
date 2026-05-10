import { useState, useEffect } from 'react';
import type { CartTotals } from '@repo/types';
import { cartStore } from '../store/cartStore';

export default function CartSummary() {
  const [totals, setTotals] = useState<CartTotals>(() => cartStore.getTotals());

  useEffect(() => {
    return cartStore.subscribe(() => setTotals(cartStore.getTotals()));
  }, []);

  const fmt = (n: number) => `${totals.currency} ${n.toFixed(2)}`;

  return (
    <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Subtotal</span><span>{fmt(totals.subtotal)}</span>
      </div>
      {totals.discount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'green' }}>
          <span>Discount</span><span>-{fmt(totals.discount)}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Tax (10%)</span><span>{fmt(totals.tax)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Shipping</span>
        <span>{totals.shipping === 0 ? 'Free' : fmt(totals.shipping)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '8px' }}>
        <span>Total</span><span>{fmt(totals.total)}</span>
      </div>
    </div>
  );
}
