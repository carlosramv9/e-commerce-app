'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { CouponForm } from '@/components/coupons/coupon-form';
import { couponsApi } from '@/lib/api/coupons';
import { toast } from 'sonner';

export default function NewCouponPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await couponsApi.create(data);
      toast.success('Cupón creado exitosamente');
      router.push('/coupons');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear cupón');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Nuevo Cupón" description="Crea un nuevo cupón de descuento" />

      <CouponForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
