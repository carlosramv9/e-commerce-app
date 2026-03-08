'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CustomerForm } from '@/components/customers/customer-form';
import { customersApi } from '@/lib/api/customers';
import { CreateCustomerDto } from '@/lib/types';
import { toast } from 'sonner';

type CustomerFormSubmitData = Parameters<
  React.ComponentProps<typeof CustomerForm>['onSubmit']
>[0];

export default function NewCustomerPage() {
  const router = useRouter();
  const t = useTranslations('customers');
  const tc = useTranslations('common');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CustomerFormSubmitData) => {
    try {
      setIsLoading(true);
      await customersApi.create(data as CreateCustomerDto);
      toast.success(t('new.createSuccess'));
      router.push('/customers');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t('new.createError');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('new.title')}
        description={t('new.description')}
        action={
          <Button variant="outline" onClick={() => router.push('/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tc('back')}
          </Button>
        }
      />
      <CustomerForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
