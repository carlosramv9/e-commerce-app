'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
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
import { Loader2 } from 'lucide-react';
import { User } from '@/lib/types';

interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  /** When true the default submit button row is not rendered (parent renders its own) */
  hideActions?: boolean;
  /** Optional id so an external submit button can target this form */
  formId?: string;
}

export function UserForm({ user, onSubmit, isLoading, hideActions, formId }: UserFormProps) {
  const t = useTranslations('users');

  const userSchema = useMemo(
    () =>
      z.object({
        firstName: z.string().min(1, t('form.firstNameRequired')),
        lastName: z.string().min(1, t('form.lastNameRequired')),
        email: z.string().email(t('form.emailRequired')),
        password: z.string().min(6, t('form.passwordMinLength')).optional().or(z.literal('')),
        role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'CASHIER']),
        status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
      }),
    [t]
  );

  type UserFormValues = z.infer<typeof userSchema>;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'STAFF',
      status: user?.status || 'ACTIVE',
    },
  });

  const handleFormSubmit = async (data: UserFormValues) => {
    if (user && !data.password) {
      const { password, ...restData } = data;
      await onSubmit(restData as UserFormValues);
    } else {
      await onSubmit(data);
    }
  };

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(handleFormSubmit)}>
        {/* Glass card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-900/5 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100/80">
            <h3 className="text-base font-semibold text-slate-800">{t('form.title')}</h3>
          </div>

          {/* Fields */}
          <div className="px-6 py-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                      {t('form.firstName')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.firstNamePlaceholder')}
                        className="bg-white/60 border-slate-200/80 focus:bg-white focus:border-indigo-300 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                      {t('form.lastName')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.lastNamePlaceholder')}
                        className="bg-white/60 border-slate-200/80 focus:bg-white focus:border-indigo-300 transition-colors"
                        {...field}
                      />
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
                <FormItem>
                  <FormLabel className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                    {t('form.email')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('form.emailPlaceholder')}
                      className="bg-white/60 border-slate-200/80 focus:bg-white focus:border-indigo-300 transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                    {user ? t('form.passwordEdit') : t('form.passwordCreate')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/60 border-slate-200/80 focus:bg-white focus:border-indigo-300 transition-colors"
                      {...field}
                    />
                  </FormControl>
                  {user && (
                    <FormDescription className="text-slate-400 text-xs">
                      {t('form.passwordDescription')}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                      {t('form.role')} *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/60 border-slate-200/80 focus:border-indigo-300">
                          <SelectValue placeholder={t('form.rolePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="STAFF">Staff</SelectItem>
                        <SelectItem value="CASHIER">{t('roleCashier')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                      {t('form.status')} *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/60 border-slate-200/80 focus:border-indigo-300">
                          <SelectValue placeholder={t('form.statusPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">{t('form.statusActive')}</SelectItem>
                        <SelectItem value="INACTIVE">{t('form.statusInactive')}</SelectItem>
                        <SelectItem value="SUSPENDED">{t('form.statusSuspended')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {!hideActions && (
            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100/80 flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {user ? t('form.submitUpdate') : t('form.submitCreate')}
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
