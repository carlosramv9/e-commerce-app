'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { RoleForm, RoleFormValues } from '@/components/roles/role-form';
import { rolesApi } from '@/lib/api/roles';
import { useAuthStore, canManageUsers } from '@/lib/store/auth-store';
import { useEffect } from 'react';

export default function NewRolePage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const canAdmin = canManageUsers(currentUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!canAdmin) router.push('/dashboard');
  }, [canAdmin, router]);

  if (!canAdmin) return null;

  const handleSubmit = async (data: RoleFormValues) => {
    try {
      setIsLoading(true);
      await rolesApi.create({
        name: data.name,
        description: data.description || undefined,
        color: data.color,
        permissionIds: data.permissionIds,
      });
      toast.success(`Rol "${data.name}" creado exitosamente`);
      router.push('/roles');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al crear el rol');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Nuevo Rol"
        description="Define un nombre, color y los permisos que tendrá este rol"
      />
      <RoleForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
