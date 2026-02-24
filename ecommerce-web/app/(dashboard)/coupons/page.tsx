'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { couponsApi } from '@/lib/api/coupons';
import { Coupon, CouponType, CouponScope } from '@/lib/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [scopeFilter, setScopeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadCoupons();
  }, [scopeFilter, page]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
      };

      if (scopeFilter) params.scope = scopeFilter;

      const response = await couponsApi.getAll(params);
      setCoupons(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      toast.error('Error al cargar cupones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;

    try {
      await couponsApi.delete(couponToDelete);
      toast.success('Cupón eliminado exitosamente');
      loadCoupons();
    } catch (error) {
      toast.error('Error al eliminar cupón');
    } finally {
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    }
  };

  const getTypeBadge = (type: CouponType, value: number) => {
    return (
      <Badge variant="secondary">
        {type === 'PERCENTAGE' ? `${value}%` : `$${value}`}
      </Badge>
    );
  };

  const getScopeBadge = (scope: CouponScope) => {
    const variants: Record<CouponScope, { label: string; className: string }> = {
      GLOBAL: { label: 'Global', className: 'bg-blue-100 text-blue-800' },
      PRODUCT: { label: 'Producto', className: 'bg-green-100 text-green-800' },
      CATEGORY: { label: 'Categoría', className: 'bg-purple-100 text-purple-800' },
    };

    const variant = variants[scope];
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.endDate) return false;
    return new Date(coupon.endDate) < new Date();
  };

  const isActive = (coupon: Coupon) => {
    if (!coupon.isActive) return false;
    if (isExpired(coupon)) return false;
    if (coupon.startDate && new Date(coupon.startDate) > new Date()) return false;
    return true;
  };

  return (
    <div>
      <PageHeader
        title="Cupones"
        description="Gestiona cupones y descuentos"
        action={
          <Button onClick={() => router.push('/coupons/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cupón
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-1 lg:w-1/3">
            <Select value={scopeFilter || 'all'} onValueChange={(value) => setScopeFilter(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los alcances" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los alcances</SelectItem>
                <SelectItem value="GLOBAL">Global</SelectItem>
                <SelectItem value="PRODUCT">Producto</SelectItem>
                <SelectItem value="CATEGORY">Categoría</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron cupones</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Alcance</TableHead>
                    <TableHead>Auto-aplicar</TableHead>
                    <TableHead>Válido Desde</TableHead>
                    <TableHead>Válido Hasta</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">{coupon.code}</TableCell>
                      <TableCell>{getTypeBadge(coupon.type, coupon.value)}</TableCell>
                      <TableCell>{getScopeBadge(coupon.scope)}</TableCell>
                      <TableCell>
                        {coupon.autoApply ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        {coupon.startDate
                          ? format(new Date(coupon.startDate), 'dd MMM yyyy', { locale: es })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {coupon.endDate
                          ? format(new Date(coupon.endDate), 'dd MMM yyyy', { locale: es })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {coupon.usageCount || 0}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isActive(coupon) ? 'default' : 'secondary'}>
                          {isActive(coupon) ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/coupons/${coupon.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCouponToDelete(coupon.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cupón será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
