import type { ProductSummary, ProductVariant } from './product.js';
import type { CartTotals } from './cart.js';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  product: ProductSummary;
  variant: ProductVariant | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totals: CartTotals;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderSummary = Pick<Order, 'id' | 'status' | 'totals' | 'createdAt'>;
