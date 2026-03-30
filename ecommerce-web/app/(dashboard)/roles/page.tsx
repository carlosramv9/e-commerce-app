'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Lock, Users, ShieldCheck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { rolesApi } from '@/lib/api/roles';
import { Role } from '@/lib/types';
import { useAuthStore, canManageUsers } from '@/lib/store/auth-store';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';

export default function RolesPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const canAdmin = canManageUsers(currentUser);

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Role | null>(null);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await rolesApi.getAll();
      setRoles(res.data);
    } catch {
      toast.error('Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canAdmin) {
      router.push('/dashboard');
      return;
    }
    loadRoles();
  }, [canAdmin, loadRoles, router]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleting(toDelete.id);
      await rolesApi.delete(toDelete.id);
      toast.success(`Rol "${toDelete.name}" eliminado`);
      setToDelete(null);
      loadRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al eliminar el rol');
    } finally {
      setDeleting(null);
    }
  };

  if (!canAdmin) return null;

  return (
    <div>
      <PageHeader
        title="Roles y Permisos"
        description="Administra los roles dinámicos y sus permisos asignados"
        action={
          <Button onClick={() => router.push('/roles/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Rol
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-white/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={() => router.push(`/roles/${role.id}/edit`)}
              onDelete={() => setToDelete(role)}
            />
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
            <AlertDialogDescription>
              El rol <strong>{toDelete?.name}</strong> será eliminado permanentemente.
              Los usuarios que lo tengan asignado perderán estos permisos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!!deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RoleCard({
  role,
  onEdit,
  onDelete,
}: {
  role: Role;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const color = role.color ?? '#6366f1';

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}20` }}
            >
              <Shield className="h-4.5 w-4.5" style={{ color }} />
            </div>
            <div>
              <CardTitle>
                {role.name}
              </CardTitle>
              {role.isSystem && (
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-400 dark:text-white/50 mt-0.5">
                  <Lock className="h-3 w-3" />
                  Sistema
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            {!role.isSystem && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {role.description && (
          <p className="text-sm text-slate-500 dark:text-white/50 mb-3 line-clamp-2">{role.description}</p>
        )}

        {/* Stats */}
        <CardFooter className="flex items-center gap-4 pt-3 border-t border-slate-100/60">
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-white/50">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>{role._count?.permissions ?? 0} permisos</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-white/50">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>{role._count?.userAssignments ?? 0} usuarios</span>
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
