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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { User } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth-store';

interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({ user, onSubmit, isLoading }: UserFormProps) {
  const t = useTranslations('users');
  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

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
    // Remove password if empty (for updates)
    if (user && !data.password) {
      const { password, ...restData } = data;
      await onSubmit(restData as UserFormValues);
    } else {
      await onSubmit(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('form.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.firstName')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.firstNamePlaceholder')} {...field} />
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
                    <FormLabel>{t('form.lastName')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.lastNamePlaceholder')} {...field} />
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
                  <FormLabel>{t('form.email')} *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t('form.emailPlaceholder')} {...field} />
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
                  <FormLabel>{user ? t('form.passwordEdit') : t('form.passwordCreate')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  {user && (
                    <FormDescription>{t('form.passwordDescription')}</FormDescription>
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
                    <FormLabel>{t('form.role')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.rolePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isSuperAdmin && <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>}
                        {isSuperAdmin && <SelectItem value="ADMIN">Admin</SelectItem>}
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="STAFF">Staff</SelectItem>
                        <SelectItem value="CASHIER">{t('roleCashier')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {!isSuperAdmin && t('form.roleDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.status')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user ? t('form.submitUpdate') : t('form.submitCreate')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
