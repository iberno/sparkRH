import { useState, useCallback } from 'react';
import { DEFAULT_ITEMS_PER_PAGE } from '../lib/constants';

interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
}

interface UsePaginationReturn {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  offset: number;
}

export function usePagination({
  initialPage = 1,
  initialPerPage = DEFAULT_ITEMS_PER_PAGE,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / perPage) || 1;
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;
  const offset = (page - 1) * perPage;

  const nextPage = useCallback(() => {
    if (!isLastPage) setPage((p) => p + 1);
  }, [isLastPage]);

  const prevPage = useCallback(() => {
    if (!isFirstPage) setPage((p) => p - 1);
  }, [isFirstPage]);

  return {
    page,
    perPage,
    total,
    totalPages,
    setPage,
    setPerPage,
    setTotal,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage,
    offset,
  };
}
