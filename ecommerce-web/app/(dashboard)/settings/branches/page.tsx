'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, MapPin, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { branchesApi } from '@/lib/api/branches';
import { Branch } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth-store';
import { BranchCard } from './(components)/BranchCard';

export default function BranchesPage() {
  const router = useRouter();
  const { currentTenant } = useAuthStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isPlusPlan = currentTenant
    ? ['PLUS', 'ENTERPRISE'].includes((currentTenant as any).plan ?? '')
    : true; // optimistic for display

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await branchesApi.getAll();
      setBranches(res.data);
    } catch {
      toast.error('Error al cargar las sucursales');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleting(true);
      await branchesApi.remove(toDelete.id);
      toast.success('Sucursal eliminada');
      setBranches((prev) => prev.filter((b) => b.id !== toDelete.id));
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al eliminar sucursal');
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const handleSetMain = async (branch: Branch) => {
    try {
      await branchesApi.setMain(branch.id);
      toast.success(`${branch.name} ahora es la sucursal principal`);
      load();
    } catch {
      toast.error('Error al actualizar la sucursal principal');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Sucursales"
        description="Gestiona las ubicaciones físicas de tu tienda"
        action={
          <Button onClick={() => router.push('/settings/branches/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva sucursal
          </Button>
        }
      />

      {/* Plan notice */}
      {!isPlusPlan && (
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Función exclusiva del plan PLUS</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Las sucursales múltiples requieren el plan PLUS o superior. Actualiza tu plan para habilitarlas.
            </p>
          </div>
        </div>
      )}

      {/* Branch grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl p-5 h-48 animate-pulse" />
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center">
            <MapPin className="h-7 w-7 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">Aún no hay sucursales registradas</p>
          <Button onClick={() => router.push('/settings/branches/new')} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Crear primera sucursal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onEdit={(id) => router.push(`/settings/branches/${id}/edit`)}
              onInventory={(id) => router.push(`/settings/branches/${id}/inventory`)}
              onSetMain={handleSetMain}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sucursal?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{toDelete?.name}</strong> y todos sus datos de inventario. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
