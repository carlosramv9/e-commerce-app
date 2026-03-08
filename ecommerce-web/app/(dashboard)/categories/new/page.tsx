'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { CategoryForm } from '@/components/categories/category-form';
import { categoriesApi } from '@/lib/api/categories';
import { toast } from 'sonner';

export default function NewCategoryPage() {
  const router = useRouter();
  const t = useTranslations('categories');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await categoriesApi.create(data);
      toast.success(t('new.createSuccess'));
      router.push('/categories');
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

      <CategoryForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
