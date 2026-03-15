'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Checkbox from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { permissionsApi } from '@/lib/api/permissions';
import { PermissionGroup, RoleWithPermissions } from '@/lib/types';
import { cn } from '@/lib/utils';

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b',
];

const MODULE_LABELS: Record<string, string> = {
  dashboard:  'Dashboard',
  pos:        'Terminal POS',
  products:   'Productos',
  categories: 'Categorías',
  orders:     'Ventas',
  customers:  'Clientes',
  coupons:    'Cupones',
  users:      'Usuarios',
  roles:      'Roles',
  reports:    'Reportes',
};

const schema = z.object({
  name:        z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  description: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
  color:       z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export interface RoleFormValues extends FormValues {
  permissionIds: string[];
}

interface RoleFormProps {
  role?: RoleWithPermissions;
  onSubmit: (data: RoleFormValues) => Promise<void>;
  isLoading: boolean;
}

export function RoleForm({ role, onSubmit, isLoading }: RoleFormProps) {
  const [groups, setGroups]           = useState<PermissionGroup[]>([]);
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [expanded, setExpanded]       = useState<Set<string>>(new Set());
  const [loadingPerms, setLoadingPerms] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        role?.name        ?? '',
      description: role?.description ?? '',
      color:       role?.color       ?? '#6366f1',
    },
  });

  const selectedColor = form.watch('color') ?? '#6366f1';

  useEffect(() => {
    permissionsApi.getGrouped()
      .then((res) => {
        setGroups(res.data);
        setExpanded(new Set(res.data.map((g) => g.module)));
        if (role) {
          setSelected(new Set(role.permissions.map((rp) => rp.permission.id)));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPerms(false));
  }, [role]);

  const totalPerms = useMemo(
    () => groups.reduce((n, g) => n + g.permissions.length, 0),
    [groups],
  );

  const togglePerm = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleModule = (group: PermissionGroup) => {
    const allSel = group.permissions.every((p) => selected.has(p.id));
    setSelected((prev) => {
      const next = new Set(prev);
      group.permissions.forEach((p) => (allSel ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  };

  const toggleExpand = (mod: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(mod) ? next.delete(mod) : next.add(mod);
      return next;
    });

  const handleSubmit = (values: FormValues) =>
    onSubmit({ ...values, permissionIds: Array.from(selected) });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* ── Basic info ── */}
        <div className="glass overflow-hidden">
          <div className="glass-header">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-800">Información del rol</h3>
              {role?.isSystem && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Sistema
                </Badge>
              )}
            </div>
            {role?.isSystem && (
              <p className="text-sm text-slate-400 mt-1">
                Los roles del sistema no pueden ser renombrados ni eliminados.
              </p>
            )}
          </div>
          <div className="glass-content space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ej. Gerente de Ventas"
                        disabled={role?.isSystem}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Color</FormLabel>
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => form.setValue('color', c)}
                      className={cn(
                        'w-7 h-7 rounded-full border-2 transition-all duration-150',
                        selectedColor === c
                          ? 'border-neutral-800 scale-125 shadow-md'
                          : 'border-transparent hover:scale-110',
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  {/* Preview */}
                  <div
                    className="ml-2 h-6 px-2.5 rounded-full flex items-center text-white text-xs font-semibold"
                    style={{ backgroundColor: selectedColor }}
                  >
                    {form.watch('name') || 'Vista previa'}
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Responsabilidades y alcance del rol..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Permissions ── */}
        <div className="glass overflow-hidden">
          <div className="glass-header">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-800">Permisos</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {selected.size} de {totalPerms} seleccionados
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelected(new Set(groups.flatMap((g) => g.permissions.map((p) => p.id))))
                  }
                >
                  Seleccionar todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(new Set())}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
          <div className="glass-content">
            {loadingPerms ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => {
                  const allSel  = group.permissions.every((p) => selected.has(p.id));
                  const someSel = group.permissions.some((p) => selected.has(p.id));
                  const isExp   = expanded.has(group.module);
                  const selCount = group.permissions.filter((p) => selected.has(p.id)).length;

                  return (
                    <div
                      key={group.module}
                      className="border border-slate-200/60 rounded-xl overflow-hidden"
                    >
                      {/* Module header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/60 cursor-pointer select-none"
                        onClick={() => toggleExpand(group.module)}
                      >
                        <span className="text-slate-400 shrink-0">
                          {isExp
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />}
                        </span>
                        <Checkbox
                          checked={allSel}
                          data-state={someSel && !allSel ? 'indeterminate' : undefined}
                          onCheckedChange={() => toggleModule(group)}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0"
                        />
                        <span className="text-sm font-semibold text-slate-800 flex-1">
                          {MODULE_LABELS[group.module] ?? group.module}
                        </span>
                        <span className="text-xs text-slate-400 tabular-nums shrink-0">
                          {selCount}/{group.permissions.length}
                        </span>
                      </div>

                      {/* Permissions grid */}
                      {isExp && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 border-t border-slate-100/60">
                          {group.permissions.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/60 transition-colors border-b border-slate-100/60 last:border-0"
                            >
                              <Checkbox
                                checked={selected.has(perm.id)}
                                onCheckedChange={() => togglePerm(perm.id)}
                                className="mt-0.5 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 leading-none">
                                  {perm.name}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  {perm.key}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="glass-footer flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || loadingPerms}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {role ? 'Actualizar rol' : 'Crear rol'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
