'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Edit, Trash2, MapPin, Phone, Star, Package,
  ShoppingCart, Users, AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { branchesApi } from '@/lib/api/branches';
import { Branch, BranchStatus } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth-store';

const STATUS_CONFIG: Record<BranchStatus, { label: string; icon: React.ElementType; cls: string }> = {
  ACTIVE:   { label: 'Activa',   icon: CheckCircle2, cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  INACTIVE: { label: 'Inactiva', icon: AlertTriangle, cls: 'text-amber-700 bg-amber-50 border-amber-200' },
  CLOSED:   { label: 'Cerrada',  icon: XCircle,      cls: 'text-slate-500 bg-slate-100 border-slate-200' },
};

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
          {branches.map((branch) => {
            const status = STATUS_CONFIG[branch.status] ?? STATUS_CONFIG.ACTIVE;
            const StatusIcon = status.icon;
            return (
              <div
                key={branch.id}
                className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-900/5 rounded-2xl overflow-hidden"
              >
                {/* Top bar */}
                <div className={`h-1 ${branch.isMain ? 'bg-slate-700' : 'bg-slate-200/80'}`} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800 truncate">{branch.name}</h3>
                        {branch.isMain && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-white">
                            <Star className="h-2.5 w-2.5" /> Principal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{branch.code}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 shrink-0 ml-2 ${status.cls}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1 mb-4">
                    {(branch.city || branch.address) && (
                      <div className="flex items-start gap-2 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                        <span className="line-clamp-1">
                          {[branch.address, branch.city, branch.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    {branch.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{branch.phone}</span>
                      </div>
                    )}
                    {branch.manager && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>{branch.manager.firstName} {branch.manager.lastName}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  {branch._count && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { icon: Users, label: 'Staff', val: branch._count.memberships },
                        { icon: ShoppingCart, label: 'Ventas', val: branch._count.orders },
                        { icon: Package, label: 'Productos', val: branch._count.inventory },
                      ].map(({ icon: Icon, label, val }) => (
                        <div key={label} className="bg-slate-50/60 border border-slate-200/50 rounded-xl px-2 py-2 text-center">
                          <p className="text-sm font-bold text-slate-800">{val}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => router.push(`/settings/branches/${branch.id}/edit`)}
                    >
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => router.push(`/settings/branches/${branch.id}/inventory`)}
                    >
                      <Package className="h-3.5 w-3.5" /> Inventario
                    </Button>
                    {!branch.isMain && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 text-slate-400 hover:text-slate-600"
                        title="Establecer como principal"
                        onClick={() => handleSetMain(branch)}
                      >
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 text-slate-400 hover:text-red-600"
                      disabled={branch.isMain}
                      title={branch.isMain ? 'No se puede eliminar la sucursal principal' : 'Eliminar'}
                      onClick={() => setToDelete(branch)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
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
