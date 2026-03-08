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
import { Customer } from '@/lib/types';

type CustomerFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  type: 'NEW' | 'REGULAR' | 'VIP' | 'WHOLESALE';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
};

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function CustomerForm({ customer, onSubmit, isLoading }: CustomerFormProps) {
  const t = useTranslations('customers');

  const customerSchema = useMemo(
    () =>
      z.object({
        firstName: z
          .string()
          .min(2, t('form.errorMinChars'))
          .max(50, t('form.errorMaxChars50')),
        lastName: z
          .string()
          .min(2, t('form.errorMinChars'))
          .max(50, t('form.errorMaxChars50')),
        email: z.string().email(t('form.errorEmail')),
        phone: z
          .string()
          .max(20, t('form.errorMaxChars20'))
          .optional()
          .or(z.literal('')),
        type: z.enum(['NEW', 'REGULAR', 'VIP', 'WHOLESALE']),
        status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']),
      }),
    [t]
  );

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
              {t('form.personalInfo')}
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
                      {t('form.firstName')} *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.firstNamePlaceholder')} className="h-10" {...field} />
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
                      {t('form.lastName')} *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.lastNamePlaceholder')} className="h-10" {...field} />
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
                    {t('form.email')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('form.emailPlaceholder')}
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('form.emailDescription')}
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
                    {t('form.phone')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={t('form.phonePlaceholder')}
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('form.phoneDescription')}
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
              {t('form.classification')}
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
                      {t('form.clientType')} *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={t('form.clientTypePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW">{t('form.typeNew')}</SelectItem>
                        <SelectItem value="REGULAR">{t('form.typeRegular')}</SelectItem>
                        <SelectItem value="VIP">{t('form.typeVip')}</SelectItem>
                        <SelectItem value="WHOLESALE">{t('form.typeWholesale')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs text-muted-foreground">
                      {t('form.clientTypeDescription')}
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
                      {t('form.status')} *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={t('form.statusPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">{t('form.statusActive')}</SelectItem>
                        <SelectItem value="INACTIVE">{t('form.statusInactive')}</SelectItem>
                        <SelectItem value="BLOCKED">{t('form.statusBlocked')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs text-muted-foreground">
                      {t('form.statusDescription')}
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
            {customer ? t('form.submitUpdate') : t('form.submitCreate')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
