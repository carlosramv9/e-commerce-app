'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/auth-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const tc = useTranslations('common');
  const { isAuthenticated, isLoading, currentTenant, availableTenants, user } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // Authenticated but tenant not yet resolved → send to picker
    // (SUPER_ADMIN with no memberships can proceed without a tenant)
    const needsTenantPicker =
      !currentTenant &&
      availableTenants.length > 0 &&
      user?.role !== 'SUPER_ADMIN';

    if (needsTenantPicker) {
      router.push('/select-tenant');
    }
  }, [isAuthenticated, isLoading, currentTenant, availableTenants, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-blue-50/40 to-indigo-50/60 dark:bg-none dark:bg-[#373A49]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-slate-500">{tc('loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="pl-64">
      <div className="absolute inset-0 min-h-screen w-full bg-white overflow-hidden">
        <div className="relative min-h-screen w-full bg-gray-400/25 dark:bg-[#373A49] overflow-hidden">
          <div className="absolute top-[50%] left-[5%] w-[500px] h-[500px] bg-gray-700/10 rounded-full blur-[120px] dark:bg-gray-700/30"></div>
          <div className="absolute top-[20%] -right-[5%] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] dark:bg-blue-900/20"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[130px] dark:bg-indigo-900/20"></div>
        </div>
      </div>
      <Sidebar />
      <Header />
      <main className="p-6">{children}</main>
    </div>
  );
}
