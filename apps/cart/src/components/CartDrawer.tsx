import { useState, useEffect } from 'react';
import type { CartItem } from '@repo/types';
import { cartStore } from '../store/cartStore';
import CartSummary from './CartSummary';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: Props) {
  const [items, setItems] = useState<CartItem[]>(() => cartStore.getItems());

  useEffect(() => {
    return cartStore.subscribe(setItems);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 100,
        }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: '360px', height: '100vh',
        background: '#fff', zIndex: 101,
        display: 'flex', flexDirection: 'column',
        padding: '20px', boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>Cart ({items.length})</h2>
          <button onClick={onClose} style={{ cursor: 'pointer', fontSize: '20px', background: 'none', border: 'none' }}>
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p style={{ color: '#888' }}>Your cart is empty.</p>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {items.map((item) => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '10px 0',
                borderBottom: '1px solid #f0f0f0',
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.product.name}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {item.quantity} × {item.product.currency} {item.unitPrice.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 500 }}>
                    {item.product.currency} {item.totalPrice.toFixed(2)}
                  </span>
                  <button
                    onClick={() => cartStore.remove(item.id)}
                    style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#e00', fontSize: '16px' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div>
            <CartSummary />
            <button
              onClick={() => cartStore.clear()}
              style={{
                marginTop: '12px', width: '100%', padding: '12px',
                background: '#111', color: '#fff', border: 'none',
                cursor: 'pointer', fontSize: '15px', borderRadius: '6px',
              }}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
