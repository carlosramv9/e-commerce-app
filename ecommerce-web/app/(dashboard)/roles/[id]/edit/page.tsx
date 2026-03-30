'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { RoleForm, RoleFormValues } from '@/components/roles/role-form';
import { rolesApi } from '@/lib/api/roles';
import { RoleWithPermissions } from '@/lib/types';
import { useAuthStore, canManageUsers } from '@/lib/store/auth-store';
import { Loader2 } from 'lucide-react';

export default function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const canAdmin = canManageUsers(currentUser);

  const [role, setRole] = useState<RoleWithPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!canAdmin) {
      router.push('/dashboard');
      return;
    }
    rolesApi.getOne(id)
      .then((res) => setRole(res.data))
      .catch(() => {
        toast.error('Error al cargar el rol');
        router.push('/roles');
      })
      .finally(() => setLoading(false));
  }, [canAdmin, id, router]);

  if (!canAdmin) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!role) return null;

  const handleSubmit = async (data: RoleFormValues) => {
    try {
      setIsLoading(true);
      await rolesApi.update(id, {
        name: data.name,
        description: data.description || undefined,
        color: data.color,
        permissionIds: data.permissionIds,
      });
      toast.success(`Rol "${data.name}" actualizado`);
      router.push('/roles');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al actualizar el rol');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={`Editar rol: ${role.name}`}
        description="Modifica el nombre, color y los permisos asignados a este rol"
      />
      <RoleForm role={role} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
