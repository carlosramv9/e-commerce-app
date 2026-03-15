'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { UserForm } from '@/components/users/user-form';
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

// ─── Shared glass surface classes ────────────────────────────────────────────
const glass = 'bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-900/5 rounded-2xl overflow-hidden';
const glassHeader = 'px-6 pt-6 pb-4 border-b border-slate-100/80 flex items-center justify-between flex-wrap gap-3';
const glassContent = 'p-6';

export default function EditUserPage() {
  const router = useRouter();
  const t = useTranslations('users');
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageUsers(currentUser);
  const { id } = useParams();

  const [user, setUser]               = useState<User | null>(null);
  const [loading, setLoading]         = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Roles state
  const [allRoles, setAllRoles]               = useState<RoleWithPermissions[]>([]);
  const [availableRoles, setAvailableRoles]   = useState<Role[]>([]);
  const [assignedRoleIds, setAssignedRoleIds] = useState<Set<string>>(new Set());
  const [savingRoles, setSavingRoles]         = useState(false);

  // Extra permissions state
  const [permGroups, setPermGroups]       = useState<PermissionGroup[]>([]);
  const [grants, setGrants]               = useState<Map<string, boolean>>(new Map());
  const [expandedMods, setExpandedMods]   = useState<Set<string>>(new Set());
  const [savingPerms, setSavingPerms]     = useState(false);

  // Derived: permission IDs already covered by assigned roles
  const rolePermIds = useMemo(() => {
    const ids = new Set<string>();
    for (const role of allRoles) {
      if (assignedRoleIds.has(role.id)) {
        for (const rp of role.permissions) ids.add(rp.permissionId);
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
      setAllRoles(userRolesRes.data.roleAssignments.map((ra) => ra.role));

      const grantMap = new Map<string, boolean>();
      userRolesRes.data.permissionGrants.forEach((g) => grantMap.set(g.permissionId, g.granted));
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

  const toggleGrant = (permId: string, value: boolean | 'remove') =>
    setGrants((prev) => {
      const next = new Map(prev);
      value === 'remove' ? next.delete(permId) : next.set(permId, value);
      return next;
    });

  const toggleExpandMod = (mod: string) =>
    setExpandedMods((prev) => {
      const next = new Set(prev);
      next.has(mod) ? next.delete(mod) : next.add(mod);
      return next;
    });

  if (!canManage) return null;

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <PageHeader title={t('edit.title')} description={t('edit.description')} />
        <div className="space-y-4">
          {[64, 48, 64].map((h, i) => (
            <div
              key={i}
              className={`${glass} animate-pulse`}
              style={{ height: `${h * 4}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ── Rendered page ────────────────────────────────────────────────────────────
  return (
    /* Gradient depth context so backdrop-blur has something to interact with */
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-20 w-[520px] h-[520px] rounded-full bg-indigo-100/50 blur-3xl -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 right-0 w-[380px] h-[380px] rounded-full bg-blue-50/60 blur-3xl -z-10"
      />

      <PageHeader title={t('edit.title')} description={t('edit.description')} />

      <div className="space-y-5">

        {/* ── Basic user info ── */}
        <UserForm user={user} onSubmit={handleSubmit} isLoading={isSubmitting} />

        {/* ── Roles assignment ── */}
        <div className={glass}>
          <div className={glassHeader}>
            <div>
              <p className="text-base font-semibold text-slate-800">Roles asignados</p>
              <p className="text-sm text-slate-400 mt-0.5">
                El usuario hereda todos los permisos de sus roles
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleSaveRoles}
              disabled={savingRoles}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
            >
              {savingRoles && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              Guardar roles
            </Button>
          </div>

          <div className={glassContent}>
            {availableRoles.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No hay roles creados aún</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {availableRoles.map((role) => {
                  const color = role.color ?? '#6366f1';
                  const checked = assignedRoleIds.has(role.id);
                  return (
                    <label
                      key={role.id}
                      className={[
                        'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150',
                        checked
                          ? 'bg-white border border-indigo-200/80 shadow-md shadow-indigo-500/10'
                          : 'bg-white/40 border border-slate-200/60 hover:bg-white/70 hover:shadow-sm',
                      ].join(' ')}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleRole(role.id)}
                        className="shrink-0"
                      />
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}18` }}
                      >
                        <Shield className="h-3.5 w-3.5" style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{role.name}</p>
                        {role._count && (
                          <p className="text-xs text-slate-400">{role._count.permissions} permisos</p>
                        )}
                      </div>
                      {checked && (
                        <Badge
                          className="shrink-0 text-[10px] px-1.5 py-0 font-semibold"
                          style={{ backgroundColor: `${color}18`, color }}
                        >
                          Activo
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Individual permissions ── */}
        <div className={glass}>
          <div className={glassHeader}>
            <div>
              <p className="text-base font-semibold text-slate-800">Permisos individuales</p>
              <p className="text-sm text-slate-400 mt-0.5 max-w-xl">
                Solo permisos <span className="text-slate-600 font-medium">no cubiertos</span> por
                los roles. Para editar permisos de un rol, ve a{' '}
                <button
                  type="button"
                  onClick={() => router.push('/roles')}
                  className="inline-flex items-center gap-0.5 text-indigo-500 hover:text-indigo-700 underline underline-offset-2 transition-colors"
                >
                  Roles <ExternalLink className="h-3 w-3" />
                </button>
                .
              </p>
            </div>
            <div className="flex items-center gap-2">
              {grants.size > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-400 hover:text-slate-700"
                  onClick={() => setGrants(new Map())}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Limpiar
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSavePerms}
                disabled={savingPerms}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
              >
                {savingPerms && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
                Guardar permisos
              </Button>
            </div>
          </div>

          <div className={glassContent}>
            <div className="space-y-2">
              {permGroups.map((group) => {
                const extraPerms = group.permissions.filter((p) => !rolePermIds.has(p.id));
                if (extraPerms.length === 0) return null;

                const isExp = expandedMods.has(group.module);
                const groupGrants = extraPerms.filter((p) => grants.has(p.id));

                return (
                  <div
                    key={group.module}
                    className="border border-slate-200/70 rounded-xl overflow-hidden"
                  >
                    {/* Module header */}
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50/70 hover:bg-slate-100/60 transition-colors select-none"
                      onClick={() => toggleExpandMod(group.module)}
                    >
                      <span className="text-slate-400 shrink-0">
                        {isExp
                          ? <ChevronDown className="h-4 w-4" />
                          : <ChevronRight className="h-4 w-4" />}
                      </span>
                      <span className="text-sm font-semibold text-slate-700 flex-1 text-left capitalize">
                        {group.module}
                      </span>
                      <span className="text-xs text-slate-400 tabular-nums shrink-0">
                        {extraPerms.length} disponible{extraPerms.length !== 1 ? 's' : ''}
                      </span>
                      {groupGrants.length > 0 && (
                        <span className="text-xs font-semibold text-emerald-600 tabular-nums shrink-0">
                          {groupGrants.length} activo{groupGrants.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </button>

                    {isExp && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 border-t border-slate-100/80">
                        {extraPerms.map((perm) => {
                          const granted = grants.get(perm.id) === true;
                          return (
                            <label
                              key={perm.id}
                              className={[
                                'flex items-start gap-3 px-4 py-3 border-b border-slate-100/60 last:border-0 cursor-pointer transition-colors',
                                granted ? 'bg-emerald-50/60' : 'hover:bg-white/60',
                              ].join(' ')}
                            >
                              <Checkbox
                                checked={granted}
                                onCheckedChange={() =>
                                  toggleGrant(perm.id, granted ? 'remove' : true)
                                }
                                className="mt-0.5 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-700 leading-none">
                                  {perm.name}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono mt-1">
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

              {/* All covered by roles */}
              {rolePermIds.size > 0 &&
                permGroups.every((g) => g.permissions.every((p) => rolePermIds.has(p.id))) && (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    Todos los permisos disponibles ya están cubiertos por los roles asignados.
                  </div>
                )}

              {/* No roles assigned — show hint */}
              {rolePermIds.size === 0 && permGroups.flatMap((g) => g.permissions).length > 0 && (
                <p className="text-xs text-slate-400 pb-1">
                  Sin roles asignados se muestran todos los permisos disponibles.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
