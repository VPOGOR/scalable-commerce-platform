import { useState, useEffect } from 'react';
import { cartStore } from '../store/cartStore';

interface Props {
  onOpen: () => void;
}

export default function CartIcon({ onOpen }: Props) {
  const [count, setCount] = useState(() => cartStore.getItems().length);

  useEffect(() => {
    return cartStore.subscribe((items) => setCount(items.length));
  }, []);

  return (
    <button onClick={onOpen} style={{ position: 'relative', cursor: 'pointer', padding: '8px 12px' }}>
      Cart
      {count > 0 && (
        <span style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'red',
          color: 'white',
          borderRadius: '50%',
          fontSize: '11px',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {count}
        </span>
      )}
    </button>
  );
}
