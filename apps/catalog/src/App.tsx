import type { ProductSummary } from '@repo/types';
import Header from './components/Header';
import ProductList from './components/ProductList';

const MOCK_PRODUCTS: ProductSummary[] = [
  {
    id: '1',
    name: 'Apple',
    slug: 'apple',
    price: 1.99,
    currency: 'USD',
    images: [],
    category: { id: 'fruits', name: 'Fruits', slug: 'fruits', parentId: null },
  },
  {
    id: '2',
    name: 'Banana',
    slug: 'banana',
    price: 0.99,
    currency: 'USD',
    images: [],
    category: { id: 'fruits', name: 'Fruits', slug: 'fruits', parentId: null },
  },
  {
    id: '3',
    name: 'Orange',
    slug: 'orange',
    price: 2.49,
    currency: 'USD',
    images: [],
    category: { id: 'fruits', name: 'Fruits', slug: 'fruits', parentId: null },
  },
];

export default function App() {
  return (
    <div>
      <h1>Catalog App</h1>
      <Header text="Product Catalog" />
      <ProductList products={MOCK_PRODUCTS} />
    </div>
  );
}
