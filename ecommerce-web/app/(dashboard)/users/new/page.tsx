'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { UserForm } from '@/components/users/user-form';
import { usersApi } from '@/lib/api/users';
import { useAuthStore, canManageUsers } from '@/lib/store/auth-store';
import type { CreateUserDto, UserRole, UserStatus } from '@/lib/types';
import { toast } from 'sonner';

type UserFormSubmitData = Parameters<
  React.ComponentProps<typeof UserForm>['onSubmit']
>[0];

export default function NewUserPage() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageUsers(currentUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!canManage) {
      toast.error('No tienes permisos para acceder a esta página');
      router.push('/dashboard');
    }
  }, [canManage, router]);

  const handleSubmit = async (data: UserFormSubmitData) => {
    try {
      setIsLoading(true);
      if (!data.password || data.password.length < 6) {
        toast.error('La contraseña es requerida (mínimo 6 caracteres)');
        return;
      }
      const payload: CreateUserDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role as UserRole,
        status: data.status as UserStatus,
      };
      await usersApi.create(payload);
      toast.success('Usuario creado exitosamente');
      router.push('/users');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al crear usuario';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canManage) {
    return null;
  }

  return (
    <div>
      <PageHeader title="Nuevo Usuario" description="Crea un nuevo usuario del sistema" />

      <UserForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
