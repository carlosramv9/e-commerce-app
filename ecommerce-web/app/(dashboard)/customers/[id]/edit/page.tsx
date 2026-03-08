'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { CustomerForm } from '@/components/customers/customer-form';
import { customersApi } from '@/lib/api/customers';
import { Customer, UpdateCustomerDto } from '@/lib/types';
import { toast } from 'sonner';

type CustomerFormSubmitData = Parameters<
  React.ComponentProps<typeof CustomerForm>['onSubmit']
>[0];

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('customers');
  const tc = useTranslations('common');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customersApi.getOne(id);
      setCustomer(response.data);
    } catch {
      toast.error(t('edit.loadError'));
      router.push('/customers');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  const handleSubmit = async (data: CustomerFormSubmitData) => {
    try {
      setIsSubmitting(true);
      await customersApi.update(id, data as UpdateCustomerDto);
      toast.success(t('edit.updateSuccess'));
      router.push(`/customers/${id}`);
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
          title={t('edit.titlePrefix')}
          description={t('edit.descriptionLoading')}
        />
        <div className="space-y-6 max-w-2xl mx-auto">
          <Skeleton className="h-56" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div>
      <PageHeader
        title={`${t('edit.titlePrefix')}: ${customer.firstName} ${customer.lastName}`}
        description={t('edit.description')}
        action={
          <Button variant="outline" onClick={() => router.push(`/customers/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tc('back')}
          </Button>
        }
      />
      <CustomerForm
        customer={customer}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
