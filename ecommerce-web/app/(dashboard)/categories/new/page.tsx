'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { CategoryForm } from '@/components/categories/category-form';
import { categoriesApi } from '@/lib/api/categories';
import { toast } from 'sonner';

export default function NewCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await categoriesApi.create(data);
      toast.success('Categoría creada exitosamente');
      router.push('/categories');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear categoría');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Nueva Categoría"
        description="Crea una nueva categoría de productos"
      />

      <CategoryForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
