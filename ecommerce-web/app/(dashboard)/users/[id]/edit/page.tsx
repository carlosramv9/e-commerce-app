'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { UserForm } from '@/components/users/user-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Checkbox from '@/components/ui/checkbox';
import { usersApi } from '@/lib/api/users';
import { rolesApi } from '@/lib/api/roles';
import { permissionsApi } from '@/lib/api/permissions';
import { useAuthStore, canManageUsers } from '@/lib/store/auth-store';
import { User, Role, RoleWithPermissions, PermissionGroup } from '@/lib/types';
import { toast } from 'sonner';
import { Shield, ChevronDown, ChevronRight, Loader2, X, ExternalLink } from 'lucide-react';

export default function EditUserPage() {
  const router = useRouter();
  const t = useTranslations('users');
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageUsers(currentUser);
  const { id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Roles state
  const [allRoles, setAllRoles] = useState<RoleWithPermissions[]>([]); // roles WITH permissions (for rolePermIds)
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);    // all roles for the picker
  const [assignedRoleIds, setAssignedRoleIds] = useState<Set<string>>(new Set());
  const [savingRoles, setSavingRoles] = useState(false);

  // Extra permissions state
  const [permGroups, setPermGroups] = useState<PermissionGroup[]>([]);
  const [grants, setGrants] = useState<Map<string, boolean>>(new Map()); // permId → granted (individual only)
  const [expandedMods, setExpandedMods] = useState<Set<string>>(new Set());
  const [savingPerms, setSavingPerms] = useState(false);

  // Derived: all permission IDs already covered by the currently assigned roles
  const rolePermIds = useMemo(() => {
    const ids = new Set<string>();
    for (const role of allRoles) {
      if (assignedRoleIds.has(role.id)) {
        for (const rp of role.permissions) {
          ids.add(rp.permissionId);
        }
      }
    }
    return ids;
  }, [allRoles, assignedRoleIds]);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, userRolesRes, permsRes, availableRolesRes] = await Promise.all([
        usersApi.getOne(id as string),
        usersApi.getRoles(id as string),
        permissionsApi.getGrouped(),
        rolesApi.getAll(),
      ]);

      setUser(userRes.data);
      setAssignedRoleIds(new Set(userRolesRes.data.roleAssignments.map((ra) => ra.roleId)));
      setPermGroups(permsRes.data);
      setExpandedMods(new Set());
      setAvailableRoles(availableRolesRes.data);

      // Store assigned roles WITH their permissions so rolePermIds can be derived
      setAllRoles(userRolesRes.data.roleAssignments.map((ra) => ra.role));

      // Only store individual user-level grants (not role-inherited ones)
      const grantMap = new Map<string, boolean>();
      userRolesRes.data.permissionGrants.forEach((g) => {
        grantMap.set(g.permissionId, g.granted);
      });
      setGrants(grantMap);
    } catch {
      toast.error(t('edit.loadError'));
      router.push('/users');
    } finally {
      setLoading(false);
    }
  }, [id, router, t]);

  useEffect(() => {
    if (!canManage) {
      toast.error(t('permissionsError'));
      router.push('/dashboard');
      return;
    }
    loadAll();
  }, [canManage, loadAll, router, t]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await usersApi.update(id as string, data);
      toast.success(t('edit.updateSuccess'));
      router.push('/users');
    } catch (error: any) {
      toast.error(error.message || t('edit.updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRoles = async () => {
    try {
      setSavingRoles(true);
      await usersApi.setRoles(id as string, Array.from(assignedRoleIds));
      // Reload user roles to refresh rolePermIds derivation
      const updated = await usersApi.getRoles(id as string);
      setAllRoles(updated.data.roleAssignments.map((ra) => ra.role));
      toast.success('Roles actualizados');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al guardar roles');
    } finally {
      setSavingRoles(false);
    }
  };

  const handleSavePerms = async () => {
    try {
      setSavingPerms(true);
      const grantsArray = Array.from(grants.entries()).map(([permissionId, granted]) => ({
        permissionId,
        granted,
      }));
      await usersApi.setPermissions(id as string, grantsArray);
      toast.success('Permisos adicionales guardados');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al guardar permisos');
    } finally {
      setSavingPerms(false);
    }
  };

  const toggleRole = (roleId: string) =>
    setAssignedRoleIds((prev) => {
      const next = new Set(prev);
      next.has(roleId) ? next.delete(roleId) : next.add(roleId);
      return next;
    });

  const toggleGrant = (permId: string, value: boolean | 'remove') => {
    setGrants((prev) => {
      const next = new Map(prev);
      value === 'remove' ? next.delete(permId) : next.set(permId, value);
      return next;
    });
  };

  const toggleExpandMod = (mod: string) =>
    setExpandedMods((prev) => {
      const next = new Set(prev);
      next.has(mod) ? next.delete(mod) : next.add(mod);
      return next;
    });

  if (!canManage) return null;

  if (loading) {
    return (
      <div>
        <PageHeader title={t('edit.title')} description={t('edit.description')} />
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <PageHeader title={t('edit.title')} description={t('edit.description')} />

      <div className="space-y-6">
        {/* ── Basic user info ── */}
        <UserForm user={user} onSubmit={handleSubmit} isLoading={isSubmitting} />

        {/* ── Roles assignment ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle>Roles asignados</CardTitle>
                <CardDescription className="mt-1">
                  El usuario hereda todos los permisos de sus roles
                </CardDescription>
              </div>
              <Button size="sm" onClick={handleSaveRoles} disabled={savingRoles}>
                {savingRoles && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
                Guardar roles
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {availableRoles.map((role) => {
                const color = role.color ?? '#6366f1';
                const checked = assignedRoleIds.has(role.id);
                return (
                  <label
                    key={role.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors"
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
                      <p className="text-sm font-medium text-neutral-900 truncate">{role.name}</p>
                      {role._count && (
                        <p className="text-xs text-neutral-400">
                          {role._count.permissions} permisos
                        </p>
                      )}
                    </div>
                    {checked && (
                      <Badge
                        className="shrink-0 text-[10px] px-1.5 py-0"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        Activo
                      </Badge>
                    )}
                  </label>
                );
              })}
              {availableRoles.length === 0 && (
                <p className="text-sm text-neutral-400 col-span-full py-4 text-center">
                  No hay roles creados aún
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Extra permissions ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle>Permisos individuales</CardTitle>
                <CardDescription className="mt-1">
                  Solo se muestran los permisos <strong>no cubiertos</strong> por los roles
                  asignados. Para modificar los permisos de un rol, edítalo directamente en{' '}
                  <button
                    type="button"
                    className="inline-flex items-center gap-0.5 text-indigo-600 underline hover:text-indigo-700"
                    onClick={() => router.push('/roles')}
                  >
                    Roles <ExternalLink className="h-3 w-3" />
                  </button>
                  .
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {grants.size > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-neutral-500"
                    onClick={() => setGrants(new Map())}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Limpiar
                  </Button>
                )}
                <Button size="sm" onClick={handleSavePerms} disabled={savingPerms}>
                  {savingPerms && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
                  Guardar permisos
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {permGroups.map((group) => {
                // Only show permissions NOT already covered by any assigned role
                const extraPerms = group.permissions.filter((p) => !rolePermIds.has(p.id));
                // Skip modules where all permissions are already covered
                if (extraPerms.length === 0) return null;

                const isExp = expandedMods.has(group.module);
                const groupGrants = extraPerms.filter((p) => grants.has(p.id));

                return (
                  <div
                    key={group.module}
                    className="border border-neutral-200 rounded-xl overflow-hidden"
                  >
                    {/* Module header */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 bg-neutral-50 cursor-pointer select-none"
                      onClick={() => toggleExpandMod(group.module)}
                    >
                      <span className="text-neutral-400 shrink-0">
                        {isExp
                          ? <ChevronDown className="h-4 w-4" />
                          : <ChevronRight className="h-4 w-4" />}
                      </span>
                      <span className="text-sm font-semibold text-neutral-800 flex-1 capitalize">
                        {group.module}
                      </span>
                      <span className="text-xs text-neutral-400 tabular-nums shrink-0">
                        {extraPerms.length} disponible{extraPerms.length !== 1 ? 's' : ''}
                      </span>
                      {groupGrants.length > 0 && (
                        <span className="text-xs font-medium text-green-600 tabular-nums shrink-0">
                          {groupGrants.length} activo{groupGrants.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {isExp && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 border-t border-neutral-100">
                        {extraPerms.map((perm) => {
                          const granted = grants.get(perm.id) === true;
                          return (
                            <label
                              key={perm.id}
                              className="flex items-start gap-3 px-4 py-3 border-b border-neutral-100 last:border-0 cursor-pointer hover:bg-neutral-50/80 transition-colors"
                            >
                              <Checkbox
                                checked={granted}
                                onCheckedChange={() =>
                                  toggleGrant(perm.id, granted ? 'remove' : true)
                                }
                                className="mt-0.5 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-neutral-800 leading-none">
                                  {perm.name}
                                </p>
                                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                  {perm.key}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty state when all permissions are covered by roles */}
              {rolePermIds.size > 0 &&
                permGroups.every((g) => g.permissions.every((p) => rolePermIds.has(p.id))) && (
                  <div className="text-center py-8 text-neutral-400 text-sm">
                    Todos los permisos disponibles ya están cubiertos por los roles asignados.
                  </div>
                )}

              {rolePermIds.size === 0 && permGroups.length > 0 &&
                permGroups.every((g) => g.permissions.every((p) => !rolePermIds.has(p.id))) &&
                permGroups.flatMap((g) => g.permissions).length > 0 && (
                  <p className="text-xs text-neutral-400 pb-1">
                    Sin roles asignados se muestran todos los permisos disponibles.
                  </p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
