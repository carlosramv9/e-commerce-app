'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, Eye, Plus } from 'lucide-react';
import { customersApi } from '@/lib/api/customers';
import { Customer, CustomerType, CustomerStatus } from '@/lib/types';
import { toast } from 'sonner';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCustomers();
  }, [search, typeFilter, statusFilter, page]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
      };

      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await customersApi.getAll(params);
      setCustomers(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      toast.error('Error al cargar clientes');
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

  const getTypeBadge = (type: CustomerType) => {
    const variants: Record<CustomerType, { label: string; className: string }> = {
      NEW: { label: 'Nuevo', className: 'bg-blue-100 text-blue-800' },
      REGULAR: { label: 'Regular', className: 'bg-green-100 text-green-800' },
      VIP: { label: 'VIP', className: 'bg-purple-100 text-purple-800' },
      WHOLESALE: { label: 'Mayorista', className: 'bg-orange-100 text-orange-800' },
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
      ACTIVE: { label: 'Activo', className: 'bg-green-100 text-green-800' },
      INACTIVE: { label: 'Inactivo', className: 'bg-gray-100 text-gray-800' },
      BLOCKED: { label: 'Bloqueado', className: 'bg-red-100 text-red-800' },
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
        title="Clientes"
        description="Gestiona la base de clientes"
        action={
          <Button onClick={() => router.push('/customers/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter || 'all'} onValueChange={(value) => setTypeFilter(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="NEW">Nuevo</SelectItem>
                <SelectItem value="REGULAR">Regular</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="WHOLESALE">Mayorista</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="INACTIVE">Inactivo</SelectItem>
                <SelectItem value="BLOCKED">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron clientes</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Órdenes</TableHead>
                    <TableHead>Total Gastado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>{getTypeBadge(customer.type)}</TableCell>
                      <TableCell>{customer.totalOrders || 0}</TableCell>
                      <TableCell>{formatCurrency(customer.totalSpent || 0)}</TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/customers/${customer.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Siguiente
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
