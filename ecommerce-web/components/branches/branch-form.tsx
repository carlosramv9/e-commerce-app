'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Branch, BranchStatus } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  name:      z.string().min(1, 'El nombre es requerido'),
  code:      z.string().min(1, 'El código es requerido').max(20),
  address:   z.string().optional(),
  city:      z.string().optional(),
  state:     z.string().optional(),
  zipCode:   z.string().optional(),
  phone:     z.string().optional(),
  email:     z.string().email('Email inválido').optional().or(z.literal('')),
  managerId: z.string().optional(),
  isMain:    z.boolean().optional(),
  status:    z.nativeEnum(BranchStatus).optional(),
});

export type BranchFormValues = z.infer<typeof schema>;

interface BranchFormProps {
  defaultValues?: Partial<BranchFormValues>;
  onSubmit: (values: BranchFormValues) => Promise<void>;
  submitting?: boolean;
  isEdit?: boolean;
}

const glass = 'bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-900/5 rounded-2xl overflow-hidden';
const labelCls = 'text-slate-600 text-xs font-semibold uppercase tracking-wide';
const inputCls = 'bg-white/60 border-slate-200/80 rounded-xl focus:bg-white focus:border-slate-300 placeholder:text-slate-400';

export function BranchForm({ defaultValues, onSubmit, submitting, isEdit }: BranchFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<BranchFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { isMain: false, status: BranchStatus.ACTIVE },
  });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const status = watch('status');
  const isMain = watch('isMain');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Identidad */}
      <div className={glass}>
        <div className="px-6 pt-5 pb-4 border-b border-slate-100/80">
          <p className="text-sm font-semibold text-slate-700">Información general</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className={labelCls}>Nombre *</Label>
            <Input {...register('name')} placeholder="Sucursal Centro" className={inputCls} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Código *</Label>
            <Input {...register('code')} placeholder="SUC-01" className={`${inputCls} font-mono uppercase`} />
            {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Teléfono</Label>
            <Input {...register('phone')} placeholder="+52 55 0000 0000" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Email</Label>
            <Input {...register('email')} type="email" placeholder="sucursal@tienda.com" className={inputCls} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
        </div>
      </div>

      {/* Dirección */}
      <div className={glass}>
        <div className="px-6 pt-5 pb-4 border-b border-slate-100/80">
          <p className="text-sm font-semibold text-slate-700">Dirección</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 space-y-1.5">
            <Label className={labelCls}>Calle y número</Label>
            <Input {...register('address')} placeholder="Av. Principal 123" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Ciudad</Label>
            <Input {...register('city')} placeholder="Ciudad de México" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Estado</Label>
            <Input {...register('state')} placeholder="CDMX" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Código postal</Label>
            <Input {...register('zipCode')} placeholder="06600" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Config */}
      <div className={glass}>
        <div className="px-6 pt-5 pb-4 border-b border-slate-100/80">
          <p className="text-sm font-semibold text-slate-700">Configuración</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {isEdit && (
            <div className="space-y-1.5">
              <Label className={labelCls}>Estado</Label>
              <Select value={status} onValueChange={(v) => setValue('status', v as BranchStatus)}>
                <SelectTrigger className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BranchStatus.ACTIVE}>Activa</SelectItem>
                  <SelectItem value={BranchStatus.INACTIVE}>Inactiva</SelectItem>
                  <SelectItem value={BranchStatus.CLOSED}>Cerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isMain"
              checked={!!isMain}
              onChange={(e) => setValue('isMain', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 accent-slate-700"
            />
            <Label htmlFor="isMain" className="text-sm text-slate-700 cursor-pointer font-normal">
              Establecer como sucursal principal
            </Label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={submitting} className="gap-2 bg-slate-800 hover:bg-slate-900 rounded-xl shadow-md shadow-slate-900/10">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Guardar cambios' : 'Crear sucursal'}
        </Button>
      </div>
    </form>
  );
}
