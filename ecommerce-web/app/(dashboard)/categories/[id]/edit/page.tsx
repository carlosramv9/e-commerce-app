'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { CategoryForm } from '@/components/categories/category-form';
import { Skeleton } from '@/components/ui/skeleton';
import { categoriesApi } from '@/lib/api/categories';
import { Category } from '@/lib/types';
import { toast } from 'sonner';

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategory();
  }, [params.id]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getOne(params.id);
      setCategory(response.data);
    } catch (error) {
      toast.error('Error al cargar categoría');
      router.push('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await categoriesApi.update(params.id, data);
      toast.success('Categoría actualizada exitosamente');
      router.push('/categories');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Editar Categoría"
          description="Modifica la información de la categoría"
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
        title="Editar Categoría"
        description="Modifica la información de la categoría"
      />

      <CategoryForm category={category} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
