import type { ProductSummary } from '@repo/types';

interface Props {
  product: ProductSummary;
}

export default function ProductCard({ product }: Props) {
  function addToCart() {
    window.dispatchEvent(new CustomEvent('cart:add', { detail: product }));
  }

  return (
    <div style={{
      border: '1px solid #eee', borderRadius: '8px',
      padding: '16px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '10px',
    }}>
      <div>
        <div style={{ fontWeight: 500 }}>{product.name}</div>
        <div style={{ color: '#555', fontSize: '14px' }}>
          {product.currency} {product.price.toFixed(2)}
        </div>
      </div>
      <button
        onClick={addToCart}
        style={{
          padding: '8px 16px', background: '#111', color: '#fff',
          border: 'none', borderRadius: '6px', cursor: 'pointer',
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}
