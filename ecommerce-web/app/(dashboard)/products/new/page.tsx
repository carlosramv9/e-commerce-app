'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { ProductForm } from '@/components/products/product-form';
import { productsApi } from '@/lib/api/products';
import { toast } from 'sonner';

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await productsApi.create(data);
      toast.success('Producto creado exitosamente');
      router.push('/products');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Nuevo Producto"
        description="Crea un nuevo producto en el catálogo"
      />

      <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
