import type { CartItem, CartTotals, ProductSummary } from '@repo/types';

type Subscriber = (items: CartItem[]) => void;

const items: CartItem[] = [];
const subscribers = new Set<Subscriber>();

function notify() {
  const snapshot = [...items];
  subscribers.forEach((fn) => fn(snapshot));
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: snapshot } }));
}

export const cartStore = {
  getItems(): CartItem[] {
    return [...items];
  },

  add(product: ProductSummary, quantity = 1): void {
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
      existing.totalPrice = existing.unitPrice * existing.quantity;
    } else {
      items.push({
        id: crypto.randomUUID(),
        product,
        variant: null,
        quantity,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
      });
    }
    notify();
  },

  remove(itemId: string): void {
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx !== -1) items.splice(idx, 1);
    notify();
  },

  clear(): void {
    items.length = 0;
    notify();
  },

  subscribe(fn: Subscriber): () => void {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },

  getTotals(): CartTotals {
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 50 ? 0 : 5.99;
    return {
      subtotal,
      discount: 0,
      tax,
      shipping,
      total: subtotal + tax + shipping,
      currency: 'USD',
    };
  },
};

// Listen for add-to-cart events dispatched by other MFEs (e.g. catalog)
window.addEventListener('cart:add', (e) => {
  const event = e as CustomEvent<ProductSummary>;
  cartStore.add(event.detail);
});
