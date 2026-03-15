'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BranchForm, BranchFormValues } from '@/components/branches/branch-form';
import { branchesApi } from '@/lib/api/branches';
import { Branch, BranchStatus } from '@/lib/types';
import { toast } from 'sonner';

export default function EditBranchPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    branchesApi.getOne(id)
      .then((res) => setBranch(res.data))
      .catch(() => toast.error('Error al cargar la sucursal'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (values: BranchFormValues) => {
    try {
      setSubmitting(true);
      await branchesApi.update(id, values as any);
      toast.success('Sucursal actualizada');
      router.push('/settings/branches');
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al actualizar la sucursal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-slate-200/60 rounded-xl animate-pulse mb-6" />
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-white/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!branch) return null;

  const defaultValues: BranchFormValues = {
    name:    branch.name,
    code:    branch.code,
    address: branch.address ?? '',
    city:    branch.city ?? '',
    state:   branch.state ?? '',
    zipCode: branch.zipCode ?? '',
    phone:   branch.phone ?? '',
    email:   branch.email ?? '',
    managerId: branch.managerId ?? '',
    isMain:  branch.isMain,
    status:  branch.status,
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Editar: {branch.name}</h1>
        <p className="text-xs font-mono text-slate-400 mt-1">{branch.code}</p>
      </div>

      <BranchForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitting={submitting}
        isEdit
      />
    </div>
  );
}
