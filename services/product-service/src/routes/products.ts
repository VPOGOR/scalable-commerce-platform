import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse, PaginatedResponse, Product, ProductSummary } from '@repo/types';
import { products } from '../data/products.js';

export const productsRouter = Router();

function toSummary(p: Product): ProductSummary {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    currency: p.currency,
    images: p.images,
    category: p.category,
  };
}

function makeResponse<T>(data: T): ApiResponse<T> {
  return { data, success: true, error: null, timestamp: new Date().toISOString() };
}

// GET /products?page=1&perPage=10&category=fruits
productsRouter.get('/', (req: Request, res: Response) => {
  const pageParam = typeof req.query['page'] === 'string' ? req.query['page'] : '1';
  const perPageParam = typeof req.query['perPage'] === 'string' ? req.query['perPage'] : '10';
  const categoryParam = typeof req.query['category'] === 'string' ? req.query['category'] : null;

  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const perPage = Math.min(50, parseInt(perPageParam, 10) || 10);

  const filtered = categoryParam
    ? products.filter((p) => p.category.slug === categoryParam && p.isActive)
    : products.filter((p) => p.isActive);

  const totalPages = Math.ceil(filtered.length / perPage);
  const slice = filtered.slice((page - 1) * perPage, page * perPage).map(toSummary);

  const paginated: PaginatedResponse<ProductSummary> = {
    data: slice,
    meta: {
      page,
      perPage,
      total: filtered.length,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    success: true,
    error: null,
  };

  res.json(makeResponse(paginated));
});

// GET /products/:id
productsRouter.get('/:id', (req: Request, res: Response) => {
  const product = products.find((p) => p.id === req.params['id']);

  if (!product) {
    const notFound: ApiResponse<null> = {
      data: null,
      success: false,
      error: { code: 'PRODUCT_NOT_FOUND', message: `Product "${req.params['id']}" not found` },
      timestamp: new Date().toISOString(),
    };
    res.status(404).json(notFound);
    return;
  }

  res.json(makeResponse(product));
});
