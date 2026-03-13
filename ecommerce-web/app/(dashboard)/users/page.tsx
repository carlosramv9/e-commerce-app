'use client';

import { useEffect, useState } from 'react';
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
import { Plus, Edit, Trash2, ShieldCheck, KeyRound } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import { useAuthStore, canManageUsers } from '@/lib/store/auth-store';
import { User, UserRole, UserStatus } from '@/lib/types';
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

export default function UsersPage() {
  const router = useRouter();
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageUsers(currentUser);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage) {
      toast.error(t('permissionsError'));
      router.push('/dashboard');
      return;
    }
    loadUsers();
  }, [roleFilter, statusFilter, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const response = await usersApi.getAll(params);
      setUsers(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await usersApi.delete(userToDelete);
      toast.success(t('deleteSuccess'));
      loadUsers();
    } catch {
      toast.error(t('deleteError'));
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, { label: string; className: string }> = {
      SUPER_ADMIN: { label: t('roleSuperAdmin'), className: 'bg-red-100 text-red-800' },
      ADMIN: { label: t('roleAdmin'), className: 'bg-orange-100 text-orange-800' },
      MANAGER: { label: t('roleManager'), className: 'bg-blue-100 text-blue-800' },
      STAFF: { label: t('roleStaff'), className: 'bg-green-100 text-green-800' },
      CASHIER: { label: t('roleCashier'), className: 'bg-purple-100 text-purple-800' },
    };
    const v = variants[role];
    return <Badge className={v.className} variant="secondary">{v.label}</Badge>;
  };

  const getStatusBadge = (status: UserStatus) => {
    const variants: Record<UserStatus, { label: string; className: string }> = {
      ACTIVE: { label: tc('statusActive'), className: 'bg-green-100 text-green-800' },
      INACTIVE: { label: tc('statusInactive'), className: 'bg-gray-100 text-gray-800' },
      SUSPENDED: { label: tc('statusSuspended'), className: 'bg-red-100 text-red-800' },
    };
    const v = variants[status];
    return <Badge className={v.className} variant="secondary">{v.label}</Badge>;
  };

  if (!canManage) return null;

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          <Button onClick={() => router.push('/users/new')}>
            <Plus className="h-4 w-4 mr-2" />
            {t('newButton')}
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              value={roleFilter || 'all'}
              onValueChange={(v) => setRoleFilter(v === 'all' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('allRoles')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allRoles')}</SelectItem>
                <SelectItem value="SUPER_ADMIN">{t('roleSuperAdmin')}</SelectItem>
                <SelectItem value="ADMIN">{t('roleAdmin')}</SelectItem>
                <SelectItem value="MANAGER">{t('roleManager')}</SelectItem>
                <SelectItem value="STAFF">{t('roleStaff')}</SelectItem>
                <SelectItem value="CASHIER">{t('roleCashier')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter || 'all'}
              onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={tc('allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc('allStatuses')}</SelectItem>
                <SelectItem value="ACTIVE">{tc('statusActive')}</SelectItem>
                <SelectItem value="INACTIVE">{tc('statusInactive')}</SelectItem>
                <SelectItem value="BLOCKED">{tc('statusBlocked')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('noResults')}</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('colName')}</TableHead>
                    <TableHead>{t('colEmail')}</TableHead>
                    <TableHead>{t('colRole')}</TableHead>
                    <TableHead>{t('colStatus')}</TableHead>
                    <TableHead>Roles / Permisos</TableHead>
                    <TableHead className="text-right">{tc('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Dynamic roles count */}
                          {(user._count?.roleAssignments ?? 0) > 0 ? (
                            <span
                              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full px-2 py-0.5"
                              title="Roles dinámicos asignados"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              {user._count!.roleAssignments}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                          {/* Extra permissions count */}
                          {(user._count?.permissionGrants ?? 0) > 0 && (
                            <span
                              className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-full px-2 py-0.5"
                              title="Permisos individuales"
                            >
                              <KeyRound className="h-3 w-3" />
                              {user._count!.permissionGrants}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/users/${user.id}/edit`)}
                            title="Editar usuario"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.id !== currentUser?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUserToDelete(user.id);
                                setDeleteDialogOpen(true);
                              }}
                              title="Eliminar usuario"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-gray-500">
                  {tc('page', { current: page, total: totalPages })}
                </p>
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc('confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{tc('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
