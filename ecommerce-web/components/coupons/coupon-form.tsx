'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { categoriesApi } from '@/lib/api/categories';
import { productsApi } from '@/lib/api/products';
import { Category, Product, Coupon } from '@/lib/types';
import { toast } from 'sonner';

interface CouponFormProps {
  coupon?: Coupon;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function CouponForm({ coupon, onSubmit, isLoading }: CouponFormProps) {
  const t = useTranslations('coupons');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const couponSchema = useMemo(
    () =>
      z.object({
        code: z.string().min(1, t('form.codeRequired')).toUpperCase(),
        description: z.string().optional(),
        type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
        value: z.number().positive(t('form.valueRequired')),
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
      }),
    [t]
  );

  type CouponFormValues = z.infer<typeof couponSchema>;

  const form = useForm<CouponFormValues>({
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
      toast.error(t('form.loadError'));
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
            <CardTitle>{t('form.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.code')} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.codePlaceholder')}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>{t('form.codeDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.status')} *</FormLabel>
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
                        <SelectItem value="true">{t('form.statusActive')}</SelectItem>
                        <SelectItem value="false">{t('form.statusInactive')}</SelectItem>
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
                  <FormLabel>{t('form.description')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('form.descriptionPlaceholder')} {...field} />
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
            <CardTitle>{t('form.discountConfig')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.discountType')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">{t('form.typePercentage')}</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">{t('form.typeFixed')}</SelectItem>
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
                    <FormLabel>{t('form.value')} *</FormLabel>
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
                      {form.watch('type') === 'PERCENTAGE' ? t('form.valueDescPercentage') : t('form.valueDescFixed')}
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
                    <FormLabel>{t('form.scope')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GLOBAL">{t('form.scopeGlobal')}</SelectItem>
                        <SelectItem value="PRODUCT">{t('form.scopeProduct')}</SelectItem>
                        <SelectItem value="CATEGORY">{t('form.scopeCategory')}</SelectItem>
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
                      <FormLabel>{t('form.productLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('form.productPlaceholder')} />
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
                      <FormLabel>{t('form.scopeCategory')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('form.categoryPlaceholder')} />
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
            <CardTitle>{t('form.autoApply')}</CardTitle>
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
                    <FormLabel className="!mt-0">{t('form.autoApplyLabel')}</FormLabel>
                  </div>
                  <FormDescription>
                    {t('form.autoApplyDescription')}
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
                      <FormLabel>{t('form.customerTypes')}</FormLabel>
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
                              {type === 'NEW' && t('form.typeNew')}
                              {type === 'REGULAR' && t('form.typeRegular')}
                              {type === 'VIP' && t('form.typeVip')}
                              {type === 'WHOLESALE' && t('form.typeWholesale')}
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
                          <FormLabel className="!mt-0">{t('form.firstPurchaseOnly')}</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minOrders"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.minOrders')}</FormLabel>
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
            <CardTitle>{t('form.restrictions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="minPurchaseAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.minPurchase')}</FormLabel>
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
                    <FormDescription>{t('form.minPurchaseDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.maxDiscount')}</FormLabel>
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
                    <FormDescription>{t('form.maxDiscountDescription')}</FormDescription>
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
                    <FormLabel>{t('form.usageLimit')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>{t('form.usageLimitDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usageLimitPerCustomer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.usageLimitPerCustomer')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>{t('form.usageLimitPerCustomerDescription')}</FormDescription>
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
            <CardTitle>{t('form.validityPeriod')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.validFrom')}</FormLabel>
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
                    <FormLabel>{t('form.validUntil')}</FormLabel>
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
            {coupon ? t('form.submitUpdate') : t('form.submitCreate')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
