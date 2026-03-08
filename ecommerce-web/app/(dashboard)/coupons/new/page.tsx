'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { CouponForm } from '@/components/coupons/coupon-form';
import { couponsApi } from '@/lib/api/coupons';
import { toast } from 'sonner';

export default function NewCouponPage() {
  const router = useRouter();
  const t = useTranslations('coupons');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await couponsApi.create(data);
      toast.success(t('new.createSuccess'));
      router.push('/coupons');
    } catch (error: any) {
      toast.error(error.message || t('new.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title={t('new.title')} description={t('new.description')} />

      <CouponForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
