'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
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
import { DollarSign, Package, ShoppingCart, Users, AlertTriangle } from 'lucide-react';
import { dashboardApi } from '@/lib/api/dashboard';
import { productsApi } from '@/lib/api/products';
import { ordersApi } from '@/lib/api/orders';
import { DashboardStats, Order, Product } from '@/lib/types';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const td = useTranslations('dashboard');
  const tc = useTranslations('common');
  const to = useTranslations('orders');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, lowStockRes] = await Promise.all([
        dashboardApi.getStats(),
        ordersApi.getAll({ limit: 5, page: 1 }),
        productsApi.getLowStock(),
      ]);

      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.data);
      setLowStockProducts(lowStockRes.data);
    } catch (error: any) {
      toast.error(td('loadError'));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-cyan-100 text-cyan-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: to('statusPending'),
      CONFIRMED: to('statusConfirmed'),
      PROCESSING: to('statusProcessing'),
      SHIPPED: to('statusShipped'),
      DELIVERED: to('statusDelivered'),
      CANCELLED: to('statusCancelled'),
      REFUNDED: to('statusRefunded'),
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" description={td('description')} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" description={td('description')} />

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title={td('stats.totalOrders')}
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
        />
        <StatCard
          title={td('stats.totalRevenue')}
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
        />
        <StatCard
          title={td('stats.customers')}
          value={stats?.totalCustomers || 0}
          icon={Users}
        />
        <StatCard
          title={td('stats.products')}
          value={stats?.totalProducts || 0}
          icon={Package}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>{td('recentOrders')}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {td('noRecentOrders')}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{td('colOrder')}</TableHead>
                    <TableHead>{td('colCustomer')}</TableHead>
                    <TableHead>{td('colTotal')}</TableHead>
                    <TableHead>{td('colStatus')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        {order.customer?.firstName} {order.customer?.lastName}
                      </TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {td('lowStock')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {td('noLowStock')}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{td('colProduct')}</TableHead>
                    <TableHead>{td('colSku')}</TableHead>
                    <TableHead>{td('colStock')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{product.stock}</Badge>
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
  );
}
