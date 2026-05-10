export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error: ApiError | null;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  success: boolean;
  error: ApiError | null;
}

export interface RequestConfig {
  signal?: AbortSignal;
  headers?: Record<string, string>;
}
