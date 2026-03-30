'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { CategoryForm } from '@/components/categories/category-form';
import { Skeleton } from '@/components/ui/skeleton';
import { categoriesApi } from '@/lib/api/categories';
import { Category } from '@/lib/types';
import { toast } from 'sonner';

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('categories');
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategory();
  }, [id]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getOne(id);
      setCategory(response.data);
    } catch (error) {
      toast.error(t('edit.loadError'));
      router.push('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await categoriesApi.update(id, data);
      toast.success(t('edit.updateSuccess'));
      router.push('/categories');
    } catch (error: any) {
      toast.error(error.message || t('edit.updateError'));
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
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title={t('edit.title')}
        description={t('edit.description')}
      />

      <CategoryForm category={category} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
