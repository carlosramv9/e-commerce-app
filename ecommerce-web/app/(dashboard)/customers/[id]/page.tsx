'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Phone, Pencil } from 'lucide-react';
import { customersApi } from '@/lib/api/customers';
import { ordersApi } from '@/lib/api/orders';
import { Customer, Order, CustomerType, CustomerStatus, OrderStatus } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('customers');
  const tc = useTranslations('common');
  const to = useTranslations('orders');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomerData = useCallback(async () => {
    try {
      setLoading(true);
      const [customerRes, ordersRes] = await Promise.all([
        customersApi.getOne(id),
        ordersApi.getAll({ customerId: id, limit: 10 }),
      ]);
      setCustomer(customerRes.data);
      setOrders(ordersRes.data.data);
    } catch {
      toast.error(t('detail.loadError'));
      router.push('/customers');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const getTypeBadge = (type: CustomerType) => {
    const variants: Record<CustomerType, { label: string; className: string }> = {
      NEW: { label: t('typeNew'), className: 'bg-blue-100 text-blue-800' },
      REGULAR: { label: t('typeRegular'), className: 'bg-green-100 text-green-800' },
      VIP: { label: t('typeVip'), className: 'bg-purple-100 text-purple-800' },
      WHOLESALE: { label: t('typeWholesale'), className: 'bg-orange-100 text-orange-800' },
    };

    const variant = variants[type];
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: CustomerStatus) => {
    const variants: Record<CustomerStatus, { label: string; className: string }> = {
      ACTIVE: { label: tc('statusActive'), className: 'bg-green-100 text-green-800' },
      INACTIVE: { label: tc('statusInactive'), className: 'bg-gray-100 text-gray-800' },
      BLOCKED: { label: tc('statusBlocked'), className: 'bg-red-100 text-red-800' },
    };

    const variant = variants[status];
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, { label: string; className: string }> = {
      PENDING: { label: to('statusPending'), className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: to('statusConfirmed'), className: 'bg-blue-100 text-blue-800' },
      PROCESSING: { label: to('statusProcessing'), className: 'bg-purple-100 text-purple-800' },
      SHIPPED: { label: to('statusShipped'), className: 'bg-cyan-100 text-cyan-800' },
      DELIVERED: { label: to('statusDelivered'), className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: to('statusCancelled'), className: 'bg-red-100 text-red-800' },
      REFUNDED: { label: to('statusRefunded'), className: 'bg-orange-100 text-orange-800' },
    };

    const variant = variants[status];
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={t('title')} description={tc('loading')} />
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const averageOrderValue = customer.totalOrders ? customer.totalSpent / customer.totalOrders : 0;

  return (
    <div>
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        description={t('detail.description')}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/customers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tc('back')}
            </Button>
            <Button onClick={() => router.push(`/customers/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" />
              {t('edit.titlePrefix')}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.infoCard')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{t('detail.email')}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{t('detail.phone')}</p>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('detail.type')}</span>
                  {getTypeBadge(customer.type)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('detail.status')}</span>
                  {getStatusBadge(customer.status)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('detail.statsCard')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('detail.totalOrders')}</span>
                <span className="font-bold">{customer.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('detail.totalSpent')}</span>
                <span className="font-bold">{formatCurrency(customer.totalSpent || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('detail.avgOrder')}</span>
                <span className="font-bold">{formatCurrency(averageOrderValue)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Addresses - Feature not yet implemented in backend */}
          {/* {customer.addresses && customer.addresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Direcciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="text-sm space-y-1">
                    <p className="font-medium">{address.label || 'Principal'}</p>
                    <p className="text-gray-600">{address.street}</p>
                    <p className="text-gray-600">
                      {address.city}, {address.state}
                    </p>
                    <p className="text-gray-600">{address.postalCode}</p>
                    <p className="text-gray-600">{address.country}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )} */}
        </div>

        {/* Orders History */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.ordersHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('detail.noOrders')}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('detail.colNumber')}</TableHead>
                      <TableHead>{t('detail.colDate')}</TableHead>
                      <TableHead>{t('detail.colItems')}</TableHead>
                      <TableHead>{t('detail.colTotal')}</TableHead>
                      <TableHead>{t('detail.colStatus')}</TableHead>
                      <TableHead className="text-right">{t('detail.colAction')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>{order.items?.length || 0}</TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/orders/${order.id}`)}
                          >
                            {tc('view')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
