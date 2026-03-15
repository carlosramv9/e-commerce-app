'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { categoriesApi } from '@/lib/api/categories';
import { Category } from '@/lib/types';
import { toast } from 'sonner';

type CategoryFormValues = {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
};

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function CategoryForm({ category, onSubmit, isLoading }: CategoryFormProps) {
  const t = useTranslations('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const categorySchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('form.nameRequired')),
        slug: z.string().min(1, t('form.slugRequired')),
        description: z.string().optional(),
        parentId: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']),
        sortOrder: z.number().int().min(0),
      }),
    [t]
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      parentId: category?.parentId || undefined,
      status: category?.status || 'ACTIVE',
      sortOrder: category?.sortOrder || 0,
    },
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoriesApi.getAll();
      // Filter out current category and its children to prevent circular references
      const filtered = response.data.filter((cat) => cat.id !== category?.id);
      setCategories(filtered);
    } catch (error) {
      toast.error(t('form.loadError'));
    } finally {
      setLoadingCategories(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    if (!category) {
      const slug = generateSlug(name);
      form.setValue('slug', slug);
    }
  };

  const renderCategoryOptions = (categories: Category[], level: number = 0): React.ReactElement[] => {
    const rootCategories = categories.filter((cat) => !cat.parentId);
    const result: React.ReactElement[] = [];

    const renderCategory = (cat: Category, currentLevel: number) => {
      const prefix = '─'.repeat(currentLevel * 2);
      result.push(
        <SelectItem key={cat.id} value={cat.id}>
          {prefix} {cat.name}
        </SelectItem>
      );

      const children = categories.filter((c) => c.parentId === cat.id);
      children.forEach((child) => renderCategory(child, currentLevel + 1));
    };

    rootCategories.forEach((cat) => renderCategory(cat, level));
    return result;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="glass overflow-hidden">
          <div className="glass-header">
            <h3 className="text-base font-semibold text-slate-800">{t('form.title')}</h3>
          </div>
          <div className="glass-content space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.name')} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.namePlaceholder')}
                        {...field}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.slug')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.slugPlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('form.slugDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('form.descriptionPlaceholder')}
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.parent')}</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                      defaultValue={field.value || 'none'}
                      disabled={loadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.parentNone')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">{t('form.parentNone')}</SelectItem>
                        {renderCategoryOptions(categories)}
                      </SelectContent>
                    </Select>
                    <FormDescription>{t('form.parentDescription')}</FormDescription>
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.order')} *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>{t('form.orderDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="glass-footer flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? t('form.submitUpdate') : t('form.submitCreate')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
