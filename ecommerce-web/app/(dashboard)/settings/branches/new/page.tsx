'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BranchForm, BranchFormValues } from '@/components/branches/branch-form';
import { branchesApi } from '@/lib/api/branches';
import { toast } from 'sonner';

export default function NewBranchPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: BranchFormValues) => {
    try {
      setSubmitting(true);
      await branchesApi.create(values as any);
      toast.success('Sucursal creada exitosamente');
      router.push('/settings/branches');
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al crear la sucursal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Nueva sucursal</h1>
        <p className="text-slate-500 text-sm mt-1">Registra una nueva ubicación para tu tienda</p>
      </div>

      <BranchForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
