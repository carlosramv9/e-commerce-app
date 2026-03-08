'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { ProductForm } from '@/components/products/product-form';
import { productsApi } from '@/lib/api/products';
import { toast } from 'sonner';

export default function NewProductPage() {
  const router = useRouter();
  const t = useTranslations('products');
  const tc = useTranslations('common');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await productsApi.create(data);
      toast.success(t('new.createSuccess'));
      router.push('/products');
    } catch (error: any) {
      toast.error(error.message || t('new.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('new.title')}
        description={t('new.description')}
      />

      <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
