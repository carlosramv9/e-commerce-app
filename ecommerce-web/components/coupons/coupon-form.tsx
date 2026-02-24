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
import { productsApi } from '@/lib/api/products';
import { Category, Product, Coupon } from '@/lib/types';
import { toast } from 'sonner';

const couponSchema = z.object({
  code: z.string().min(1, 'Código es requerido').toUpperCase(),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  value: z.number().positive('El valor debe ser mayor a 0'),
  scope: z.enum(['GLOBAL', 'PRODUCT', 'CATEGORY']),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  autoApply: z.boolean(),
  autoApplyCustomerTypes: z.array(z.enum(['NEW', 'REGULAR', 'VIP', 'WHOLESALE'])).optional(),
  firstPurchaseOnly: z.boolean(),
  minOrders: z.number().int().min(0).optional(),
  minPurchaseAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(0).optional(),
  usageLimitPerCustomer: z.number().int().min(0).optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  active: z.boolean(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponFormProps {
  coupon?: Coupon;
  onSubmit: (data: CouponFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function CouponForm({ coupon, onSubmit, isLoading }: CouponFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<z.infer<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code || '',
      description: coupon?.description || '',
      type: coupon?.type || 'PERCENTAGE',
      value: coupon?.value || 0,
      scope: coupon?.scope || 'GLOBAL',
      productId: coupon?.productId || undefined,
      categoryId: coupon?.categoryId || undefined,
      autoApply: coupon?.autoApply || false,
      autoApplyCustomerTypes: coupon?.customerTypes || [],
      firstPurchaseOnly: coupon?.isFirstPurchaseOnly || false,
      minOrders: coupon?.minOrders || undefined,
      minPurchaseAmount: coupon?.minPurchase || undefined,
      maxDiscount: coupon?.maxDiscount || undefined,
      usageLimit: coupon?.usageLimit || undefined,
      usageLimitPerCustomer: coupon?.usageLimitPerCustomer || undefined,
      validFrom: coupon?.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      validTo: coupon?.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
      active: coupon?.isActive ?? true,
    },
  });

  const scope = form.watch('scope');
  const autoApply = form.watch('autoApply');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [categoriesRes, productsRes] = await Promise.all([
        categoriesApi.getAll(),
        productsApi.getAll({ status: 'ACTIVE', limit: 100 }),
      ]);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="DESCUENTO10"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>Código único del cupón</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Textarea placeholder="Descripción del cupón" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Discount Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Descuento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Porcentaje</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Cantidad Fija</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch('type') === 'PERCENTAGE' ? 'Porcentaje de descuento' : 'Monto fijo en MXN'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alcance *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GLOBAL">Global</SelectItem>
                        <SelectItem value="PRODUCT">Producto Específico</SelectItem>
                        <SelectItem value="CATEGORY">Categoría</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {scope === 'PRODUCT' && (
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Producto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un producto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {product.sku}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {scope === 'CATEGORY' && (
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Auto-Application */}
        <Card>
          <CardHeader>
            <CardTitle>Auto-Aplicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="autoApply"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Aplicar automáticamente</FormLabel>
                  </div>
                  <FormDescription>
                    El cupón se aplicará automáticamente a clientes elegibles
                  </FormDescription>
                </FormItem>
              )}
            />

            {autoApply && (
              <>
                <FormField
                  control={form.control}
                  name="autoApplyCustomerTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipos de Cliente</FormLabel>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {(['NEW', 'REGULAR', 'VIP', 'WHOLESALE'] as const).map((type) => (
                          <div key={type} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={type}
                              checked={field.value?.includes(type)}
                              onChange={(e) => {
                                const current = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...current, type]);
                                } else {
                                  field.onChange(current.filter((t) => t !== type));
                                }
                              }}
                              className="h-4 w-4"
                            />
                            <label htmlFor={type} className="text-sm">
                              {type === 'NEW' && 'Nuevo'}
                              {type === 'REGULAR' && 'Regular'}
                              {type === 'VIP' && 'VIP'}
                              {type === 'WHOLESALE' && 'Mayorista'}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstPurchaseOnly"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Solo primera compra</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minOrders"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mínimo de órdenes</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Restrictions */}
        <Card>
          <CardHeader>
            <CardTitle>Restricciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="minPurchaseAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compra mínima</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Monto mínimo de compra requerido</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descuento máximo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Límite máximo de descuento</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Límite de uso total</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Usos totales permitidos</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usageLimitPerCustomer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Límite por cliente</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Usos por cliente</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Validity Period */}
        <Card>
          <CardHeader>
            <CardTitle>Período de Validez</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Válido desde</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Válido hasta</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {coupon ? 'Actualizar Cupón' : 'Crear Cupón'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
