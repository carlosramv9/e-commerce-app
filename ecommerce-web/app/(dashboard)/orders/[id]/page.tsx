'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Printer } from 'lucide-react';
import { ordersApi } from '@/lib/api/orders';
import { Order, OrderStatus } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const t = useTranslations('orders');
  const tc = useTranslations('common');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getOne(params.id);
      setOrder(response.data);
    } catch (error) {
      toast.error(t('detail.loadError'));
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      setUpdatingStatus(true);
      await ordersApi.updateStatus(params.id, newStatus);
      toast.success(t('detail.updateStatusSuccess'));
      loadOrder();
    } catch (error) {
      toast.error(t('detail.updateStatusError'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendReceipt = async () => {
    if (!order?.customer?.email) {
      toast.error(t('detail.noCustomerEmail'));
      return;
    }

    try {
      setSendingEmail(true);
      await ordersApi.sendReceipt(params.id, order.customer.email);
      toast.success(t('detail.receiptSentSuccess'));
    } catch (error) {
      toast.error(t('detail.receiptSentError'));
    } finally {
      setSendingEmail(false);
    }
  };

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

  if (loading) {
    return (
      <div>
        <PageHeader title={t('detail.title')} description={tc('loading')} />
        <div className="space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title={`Orden ${order.orderNumber}`}
        description={format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", {
          locale: es,
        })}
        action={
          <Button variant="outline" onClick={() => router.push('/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tc('back')}
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.products')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('detail.colProduct')}</TableHead>
                    <TableHead>{t('detail.colSku')}</TableHead>
                    <TableHead className="text-center">{t('detail.colQty')}</TableHead>
                    <TableHead className="text-right">{t('detail.colPrice')}</TableHead>
                    <TableHead className="text-right">{t('detail.colTotal')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.productSku}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('detail.subtotal')}</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t('detail.discount')} {order.couponCode && `(${order.couponCode})`}
                    </span>
                    <span className="text-green-600">-{formatCurrency(order.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('detail.tax')}</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('detail.shipping')}</span>
                  <span>{formatCurrency(order.shippingCost)}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between font-bold text-lg">
                  <span>{t('detail.total')}</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Shipping */}
          {order.customer && (
            <Card>
              <CardHeader>
                <CardTitle>{t('detail.customerInfo')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">{t('detail.customerData')}</h4>
                    <div className="text-sm space-y-1">
                      <p>
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-gray-600">{order.customer.email}</p>
                      <p className="text-gray-600">{order.customer.phone}</p>
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div>
                      <h4 className="font-medium mb-2">{t('detail.shippingAddress')}</h4>
                      <div className="text-sm space-y-1">
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                        <p>{order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.orderStatus')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('detail.currentStatus')}:</span>
                {getStatusBadge(order.status)}
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium mb-2 block">{t('detail.changeStatus')}</label>
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusUpdate(value as OrderStatus)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                {t('detail.printReceipt')}
              </Button>

              {order.customer?.email && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleSendReceipt}
                  disabled={sendingEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {t('detail.sendEmail')}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.paymentInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.payment ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('detail.paymentMethod')}:</span>
                    <span className="font-medium">{order.payment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('detail.paymentStatus')}:</span>
                    <span className="font-medium">{order.payment.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('detail.paymentAmount')}:</span>
                    <span className="font-medium">{formatCurrency(order.payment.amount)}</span>
                  </div>
                  {order.payment.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('detail.transactionId')}:</span>
                      <span className="font-mono text-xs">{order.payment.transactionId}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm">{t('detail.noPaymentInfo')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
