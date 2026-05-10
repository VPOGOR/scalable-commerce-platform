import type { ProductSummary } from '@repo/types';
import ProductCard from './ProductCard';

interface Props {
  products: ProductSummary[];
}

export default function ProductList({ products }: Props) {
  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
