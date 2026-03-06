'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Customer } from '@/lib/types';

const customerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .max(20, 'Máximo 20 caracteres')
    .optional()
    .or(z.literal('')),
  type: z.enum(['NEW', 'REGULAR', 'VIP', 'WHOLESALE']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function CustomerForm({ customer, onSubmit, isLoading }: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: customer?.firstName ?? '',
      lastName: customer?.lastName ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      type: customer?.type ?? 'NEW',
      status: customer?.status ?? 'ACTIVE',
    },
  });

  const handleSubmit = async (values: CustomerFormValues) => {
    const payload = {
      ...values,
      phone: values.phone || undefined,
    };
    await onSubmit(payload as CustomerFormValues);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-8 max-w-2xl mx-auto"
      >
        {/* Personal Information */}
        <Card className="border-border/80 bg-card shadow-xs rounded-xl overflow-hidden gap-0">
          <CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Información personal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-foreground font-medium text-sm">
                      Nombre *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Juan" className="h-10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-foreground font-medium text-sm">
                      Apellido *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Pérez" className="h-10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-foreground font-medium text-sm">
                    Email *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="juan.perez@ejemplo.com"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Dirección de correo electrónico única
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-foreground font-medium text-sm">
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Número de contacto (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Classification */}
        <Card className="border-border/80 bg-card shadow-xs rounded-xl overflow-hidden gap-0">
          <CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Clasificación
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-foreground font-medium text-sm">
                      Tipo de cliente *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW">Nuevo</SelectItem>
                        <SelectItem value="REGULAR">Regular</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="WHOLESALE">Mayorista</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs text-muted-foreground">
                      Categoría para descuentos y promociones
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-foreground font-medium text-sm">
                      Estado *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                        <SelectItem value="BLOCKED">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs text-muted-foreground">
                      Controla el acceso del cliente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex flex-col items-end gap-3 pt-2 border-t border-border/60">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[180px] h-11 font-medium"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {customer ? 'Actualizar cliente' : 'Crear cliente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
