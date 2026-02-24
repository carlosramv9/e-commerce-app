'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { UserForm } from '@/components/users/user-form';
import { Skeleton } from '@/components/ui/skeleton';
import { usersApi } from '@/lib/api/users';
import { useAuthStore, canManageUsers } from '@/lib/store/auth-store';
import { User } from '@/lib/types';
import { toast } from 'sonner';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageUsers(currentUser);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!canManage) {
      toast.error('No tienes permisos para acceder a esta página');
      router.push('/dashboard');
      return;
    }
    loadUser();
  }, [params.id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getOne(params.id);
      setUser(response.data);
    } catch (error) {
      toast.error('Error al cargar usuario');
      router.push('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await usersApi.update(params.id, data);
      toast.success('Usuario actualizado exitosamente');
      router.push('/users');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManage) {
    return null;
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Editar Usuario" description="Modifica la información del usuario" />
        <div className="space-y-6">
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <PageHeader title="Editar Usuario" description="Modifica la información del usuario" />

      <UserForm user={user} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
