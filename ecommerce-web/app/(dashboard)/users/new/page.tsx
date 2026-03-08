'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('users');
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageUsers(currentUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!canManage) {
      toast.error(t('permissionsError'));
      router.push('/dashboard');
    }
  }, [canManage, router]);

  const handleSubmit = async (data: UserFormSubmitData) => {
    try {
      setIsLoading(true);
      if (!data.password || data.password.length < 6) {
        toast.error(t('new.passwordRequired'));
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
      toast.success(t('new.createSuccess'));
      router.push('/users');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('new.createError');
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
      <PageHeader title={t('new.title')} description={t('new.description')} />

      <UserForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
