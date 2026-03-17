'use client';

import { useEffect, useState, useTransition } from 'react';
import { productsApi } from '@/lib/api/products';
import { customersApi } from '@/lib/api/customers';
import { categoriesApi } from '@/lib/api/categories';
import { Product, Customer, Category } from '@/lib/types';
import { toast } from 'sonner';

/**
 * Carga datos iniciales del POS (clientes, categorías) en paralelo.
 * Productos se cargan según búsqueda y filtro de categoría (evita waterfall).
 */
export function usePOSData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  // Carga inicial: clientes y categorías en paralelo (async-parallel)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [customersRes, categoriesRes] = await Promise.all([
          customersApi.getAll(),
          categoriesApi.getAll(),
        ]);
        setCustomers(customersRes.data.data ?? customersRes.data ?? []);
        setCategories(categoriesRes.data ?? []);
      } catch {
        toast.error('Error al cargar datos iniciales');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Productos según búsqueda y categoría
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const params: { status: string; limit: number; search?: string; categoryId?: string } = {
          status: 'ACTIVE',
          limit: 100,
        };
        if (search) params.search = search;
        if (categoryFilter) params.categoryId = categoryFilter;

        const response = await productsApi.getAll(params);
        startTransition(() => {
          setProducts(response.data.data ?? []);
        });
      } catch {
        toast.error('Error al cargar productos');
      }
    };
    loadProducts();
  }, [search, categoryFilter]);

  return {
    products,
    customers,
    categories,
    loading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    isPending,
  };
}
