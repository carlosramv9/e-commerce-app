'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customersApi.getOne(id);
      setCustomer(response.data);
    } catch {
      toast.error('Error al cargar cliente');
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
      toast.success('Cliente actualizado exitosamente');
      router.push(`/customers/${id}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error al actualizar cliente';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Editar Cliente"
          description="Cargando información del cliente..."
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
        title={`Editar: ${customer.firstName} ${customer.lastName}`}
        description="Modifica la información del cliente"
        action={
          <Button variant="outline" onClick={() => router.push(`/customers/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
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
