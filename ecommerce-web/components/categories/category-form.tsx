'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { categoriesApi } from '@/lib/api/categories';
import { Category } from '@/lib/types';
import { toast } from 'sonner';

const categorySchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  slug: z.string().min(1, 'Slug es requerido'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  sortOrder: z.number().int().min(0),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function CategoryForm({ category, onSubmit, isLoading }: CategoryFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

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
      toast.error('Error al cargar categorías');
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
        <Card>
          <CardHeader>
            <CardTitle>Información de Categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre de la categoría"
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
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="nombre-categoria" {...field} />
                    </FormControl>
                    <FormDescription>URL amigable (se genera automáticamente)</FormDescription>
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la categoría"
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
                    <FormLabel>Categoría Padre</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                      defaultValue={field.value || 'none'}
                      disabled={loadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin categoría padre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sin categoría padre</SelectItem>
                        {renderCategoryOptions(categories)}
                      </SelectContent>
                    </Select>
                    <FormDescription>Opcional: categoría de nivel superior</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Activa</SelectItem>
                        <SelectItem value="INACTIVE">Inactiva</SelectItem>
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
                    <FormLabel>Orden *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Orden de visualización</FormDescription>
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
            {category ? 'Actualizar Categoría' : 'Crear Categoría'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
