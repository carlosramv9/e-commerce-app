'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { ProductForm } from '@/components/products/product-form';
import { Skeleton } from '@/components/ui/skeleton';
import { productsApi } from '@/lib/api/products';
import { Product } from '@/lib/types';
import { toast } from 'sonner';

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsApi.getOne(id);
      setProduct(response.data);
    } catch {
      toast.error('Error al cargar producto');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await productsApi.update(id, data);
      toast.success('Producto actualizado exitosamente');
      router.push('/products');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Editar Producto"
          description="Modifica la información del producto"
        />
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Editar Producto"
        description="Modifica la información del producto"
      />

      <ProductForm product={product} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
