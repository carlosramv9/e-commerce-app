'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { UserForm } from '@/components/users/user-form';
import { Button } from '@/components/ui/button';
import Checkbox from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Shield, Info, Loader2 } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import { rolesApi } from '@/lib/api/roles';
import { useAuthStore, canManageUsers } from '@/lib/store/auth-store';
import type { CreateUserDto, UserRole, UserStatus, Role } from '@/lib/types';
import { toast } from 'sonner';

type UserFormSubmitData = Parameters<
  React.ComponentProps<typeof UserForm>['onSubmit']
>[0];

const FORM_ID = 'new-user-form';

export default function NewUserPage() {
  const router = useRouter();
  const t = useTranslations('users');
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageUsers(currentUser);

  const [isLoading, setIsLoading] = useState(false);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!canManage) {
      toast.error(t('permissionsError'));
      router.push('/dashboard');
      return;
    }
    rolesApi.getAll().then((res) => setAllRoles(res.data)).catch(() => {});
  }, [canManage, router, t]);

  const toggleRole = (roleId: string) =>
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      next.has(roleId) ? next.delete(roleId) : next.add(roleId);
      return next;
    });

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

      const created = await usersApi.create(payload);
      const newUserId = created.data.id;

      if (selectedRoleIds.size > 0) {
        await usersApi.setRoles(newUserId, Array.from(selectedRoleIds));
      }

      toast.success(
        selectedRoleIds.size > 0
          ? `${t('new.createSuccess')} — ${selectedRoleIds.size} rol(es) asignado(s)`
          : t('new.createSuccess')
      );
      router.push('/users');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('new.createError');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canManage) return null;

  return (
    <div>
      <PageHeader title={t('new.title')} description={t('new.description')} />

      <div className="space-y-6">
        {/* Basic user form — submit button hidden, triggered by external button below */}
        <UserForm
          formId={FORM_ID}
          hideActions
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {/* Roles — optional, assigned right after creation */}
        <div className="glass overflow-hidden">
          <div className="glass-header">
            <h3 className="text-base font-semibold text-slate-800">Roles iniciales</h3>
            <div className="flex items-start gap-2 mt-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
              <span className="text-sm text-slate-500">
                Opcional. Selecciona los roles que se asignarán al guardar el usuario.
                Los permisos individuales se configuran desde la edición, una vez creado.
              </span>
            </div>
          </div>
          <div className="glass-content">
            {allRoles.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                No hay roles disponibles.{' '}
                <button
                  type="button"
                  className="text-indigo-600 underline hover:text-indigo-700"
                  onClick={() => router.push('/roles')}
                >
                  Crear roles
                </button>{' '}
                primero.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {allRoles.map((role) => {
                  const color = role.color ?? '#6366f1';
                  const checked = selectedRoleIds.has(role.id);
                  return (
                    <label
                      key={role.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 cursor-pointer hover:bg-white/60 transition-colors"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleRole(role.id)}
                        className="shrink-0"
                      />
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Shield className="h-3.5 w-3.5" style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{role.name}</p>
                        {role._count && (
                          <p className="text-xs text-slate-400">
                            {role._count.permissions} permisos
                          </p>
                        )}
                      </div>
                      {checked && (
                        <Badge
                          className="shrink-0 text-[10px] px-1.5 py-0"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          Seleccionado
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Submit — targets the form via form attribute */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/users')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('form.submitCreate')}
          </Button>
        </div>
      </div>
    </div>
  );
}
