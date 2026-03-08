'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { ProductForm } from '@/components/products/product-form';
import { Skeleton } from '@/components/ui/skeleton';
import { productsApi } from '@/lib/api/products';
import { Product, UpdateProductDto } from '@/lib/types';
import { toast } from 'sonner';

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('products');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsApi.getOne(id);
      setProduct(response.data);
    } catch {
      toast.error(t('edit.loadError'));
      router.push('/products');
    } finally {
      setLoading(false);
    }
  }, [id, router, t]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleSubmit = async (
    data: Parameters<React.ComponentProps<typeof ProductForm>['onSubmit']>[0]
  ) => {
    try {
      setIsSubmitting(true);
      await productsApi.update(id, data as UpdateProductDto);
      toast.success(t('edit.updateSuccess'));
      router.push('/products');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t('edit.updateError');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title={t('edit.title')}
          description={t('edit.description')}
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
        title={t('edit.title')}
        description={t('edit.description')}
      />

      <ProductForm product={product} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
