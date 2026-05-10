import type { ProductSummary, ProductVariant } from './product.js';

export interface CartItem {
  id: string;
  product: ProductSummary;
  variant: ProductVariant | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
}

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string;
  items: CartItem[];
  totals: CartTotals;
  couponCode: string | null;
  updatedAt: string;
}
