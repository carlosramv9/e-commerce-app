'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { CouponForm } from '@/components/coupons/coupon-form';
import { Skeleton } from '@/components/ui/skeleton';
import { couponsApi } from '@/lib/api/coupons';
import { Coupon } from '@/lib/types';
import { toast } from 'sonner';

export default function EditCouponPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const t = useTranslations('coupons');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCoupon();
  }, [params.id]);

  const loadCoupon = async () => {
    try {
      setLoading(true);
      const response = await couponsApi.getOne(params.id);
      setCoupon(response.data);
    } catch (error) {
      toast.error(t('edit.loadError'));
      router.push('/coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await couponsApi.update(params.id, data);
      toast.success(t('edit.updateSuccess'));
      router.push('/coupons');
    } catch (error: any) {
      toast.error(error.message || t('edit.updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={t('edit.title')} description={t('edit.description')} />
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!coupon) {
    return null;
  }

  return (
    <div>
      <PageHeader title={t('edit.title')} description={t('edit.description')} />

      <CouponForm coupon={coupon} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
