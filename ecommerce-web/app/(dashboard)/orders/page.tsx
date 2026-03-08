'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Eye, Plus } from 'lucide-react';
import { ordersApi } from '@/lib/api/orders';
import { Order, OrderStatus } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function OrdersPage() {
  const router = useRouter();
  const t = useTranslations('orders');
  const tc = useTranslations('common');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page,
        limit: 10,
      };
      if (statusFilter) params.status = statusFilter;

      const response = await ordersApi.getAll(params);
      setOrders(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, { label: string; className: string }> = {
      PENDING: { label: t('statusPending'), className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: t('statusConfirmed'), className: 'bg-blue-100 text-blue-800' },
      PROCESSING: { label: t('statusProcessing'), className: 'bg-purple-100 text-purple-800' },
      SHIPPED: { label: t('statusShipped'), className: 'bg-cyan-100 text-cyan-800' },
      DELIVERED: { label: t('statusDelivered'), className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: t('statusCancelled'), className: 'bg-red-100 text-red-800' },
      REFUNDED: { label: t('statusRefunded'), className: 'bg-orange-100 text-orange-800' },
    };

    const variant = variants[status];
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          <Button onClick={() => router.push('/pos')}>
            <Plus className="h-4 w-4 mr-2" />
            {t('newButton')}
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-1 lg:w-1/3">
            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="PENDING">{t('statusPending')}</SelectItem>
                <SelectItem value="CONFIRMED">{t('statusConfirmed')}</SelectItem>
                <SelectItem value="PROCESSING">{t('statusProcessing')}</SelectItem>
                <SelectItem value="SHIPPED">{t('statusShipped')}</SelectItem>
                <SelectItem value="DELIVERED">{t('statusDelivered')}</SelectItem>
                <SelectItem value="CANCELLED">{t('statusCancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('noResults')}</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('colOrderNum')}</TableHead>
                    <TableHead>{t('colCustomer')}</TableHead>
                    <TableHead>{t('colDate')}</TableHead>
                    <TableHead>{t('colItems')}</TableHead>
                    <TableHead>{t('colTotal')}</TableHead>
                    <TableHead>{tc('allStatuses')}</TableHead>
                    <TableHead className="text-right">{tc('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        {order.customer ? (
                          <>
                            {order.customer.firstName} {order.customer.lastName}
                            <div className="text-sm text-gray-500">{order.customer.email}</div>
                          </>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: es })}
                        <div className="text-sm text-gray-500">
                          {format(new Date(order.createdAt), 'HH:mm', { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell>{order.items?.length || 0}</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {tc('view')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-500">
                  {tc('page', { current: page, total: totalPages })}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    {tc('previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    {tc('next')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
