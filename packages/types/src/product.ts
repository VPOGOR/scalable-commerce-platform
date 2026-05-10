export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  images: ProductImage[];
  category: ProductCategory;
  variants: ProductVariant[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductSummary = Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'currency' | 'images' | 'category'>;
