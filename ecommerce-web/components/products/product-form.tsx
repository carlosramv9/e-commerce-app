'use client';

import { useEffect, useState } from 'react';
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
import { Category, Product } from '@/lib/types';
import { toast } from 'sonner';

const productSchema = z.object({
  sku: z.string().min(1, 'SKU es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  slug: z.string().min(1, 'Slug es requerido'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Categoría es requerida'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  taxRate: z.number().min(0).max(100).optional(),
  taxCode: z.enum(['IVA_16', 'IVA_11', 'IVA_8', 'EXCENTO']).optional(),
  comparePrice: z.number().optional(),
  costPrice: z.number().optional(),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  trackInventory: z.boolean(),
  lowStockAlert: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, isLoading }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: product?.sku || '',
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      categoryId: product?.categoryId || '',
      price: product?.price ?? 0,
      taxRate: product?.taxRate ?? undefined,
      taxCode: (product?.taxCode as 'IVA_16' | 'IVA_11' | 'IVA_8' | 'EXCENTO') || 'IVA_16',
      comparePrice: product?.comparePrice ?? undefined,
      costPrice: product?.costPrice ?? undefined,
      stock: product?.stock ?? 0,
      trackInventory: product?.trackInventory ?? true,
      lowStockAlert: product?.lowStockAlert ?? 10,
      status: product?.status || 'DRAFT',
      metaTitle: product?.metaTitle || '',
      metaDescription: product?.metaDescription || '',
    },
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch {
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
    if (!product) {
      const slug = generateSlug(name);
      form.setValue('slug', slug);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 max-w-3xl mx-auto"
      >
        {/* Basic Information */}
        <Card className="border-border/80 bg-card shadow-xs rounded-xl overflow-hidden gap-0">
          <CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Información básica
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-foreground font-medium text-sm">SKU *</FormLabel>
                    <FormControl>
                      <Input placeholder="PROD-001" className="h-10" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Código único del producto
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
                    <FormLabel className="text-foreground font-medium text-sm">Estado *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Borrador</SelectItem>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                        <SelectItem value="ARCHIVED">Archivado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-foreground font-medium text-sm">Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del producto"
                      className="h-10"
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-foreground font-medium text-sm">Slug *</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre-del-producto" className="h-10" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    URL amigable (se genera automáticamente)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-foreground font-medium text-sm">Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción detallada del producto"
                      className="min-h-28 resize-y text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-foreground font-medium text-sm">Categoría *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="border-border/80 bg-card shadow-xs rounded-xl overflow-hidden gap-0">
          <CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Precios e impuestos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-foreground font-medium text-sm">Precio de venta *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-10"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Precio neto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comparePrice"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-foreground font-medium text-sm">Precio comparación</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-10"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Antes de descuento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-foreground font-medium text-sm">Costo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-10"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Costo del producto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="taxCode"
              render={({ field }) => (
                <FormItem className="space-y-1.5 max-w-xs">
                  <FormLabel className="text-foreground font-medium text-sm">Código fiscal</FormLabel>
                  <Select
                    onValueChange={(value: string) => {
                      field.onChange(value);
                      form.setValue(
                        'taxRate',
                        value === 'IVA_16' ? 16 : value === 'IVA_11' ? 11 : value === 'IVA_8' ? 8 : 0
                      );
                    }}
                    value={field.value ?? 'IVA_16'}
                    defaultValue={field.value ?? 'IVA_16'}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecciona código" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IVA_16">IVA 16%</SelectItem>
                      <SelectItem value="IVA_11">IVA 11%</SelectItem>
                      <SelectItem value="IVA_8">IVA 8%</SelectItem>
                      <SelectItem value="EXCENTO">Exento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-muted-foreground">
                    Tipo de IVA
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card className="border-border/80 bg-card shadow-xs rounded-xl overflow-hidden gap-0">
          <CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Inventario
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-foreground font-medium text-sm">Stock *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        className="h-10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Cantidad disponible
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lowStockAlert"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-foreground font-medium text-sm">Alerta stock bajo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        className="h-10"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Mínimo antes de alerta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card className="border-border/80 bg-card shadow-xs rounded-xl overflow-hidden gap-0">
          <CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-foreground font-medium text-sm">Meta título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título para búsqueda" className="h-10" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Título en resultados de búsqueda
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-foreground font-medium text-sm">Meta descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción para búsqueda"
                      className="min-h-24 resize-y text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Descripción en resultados de búsqueda
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            {product ? 'Actualizar producto' : 'Crear producto'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
