'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Building2, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { TenantPlan } from '@/lib/types';
import { cn } from '@/lib/utils';

const planCls: Record<TenantPlan, string> = {
  [TenantPlan.FREE]: 'bg-slate-100 text-slate-500',
  [TenantPlan.STARTER]: 'bg-emerald-50 text-emerald-600',
  [TenantPlan.PRO]: 'bg-blue-50 text-blue-600',
  [TenantPlan.PLUS]: 'bg-violet-50 text-violet-600',
  [TenantPlan.ENTERPRISE]: 'bg-amber-50 text-amber-600',
};

export function Header() {
  const router = useRouter();
  const { user, logout, currentTenant, availableTenants } = useAuthStore();
  const t = useTranslations('auth');

  const handleLogout = () => {
    logout();
    toast.success(t('logoutSuccess'));
    router.push('/login');
  };

  const handleSwitchTenant = () => {
    router.push('/select-tenant');
  };

  const canSwitchTenant = availableTenants.length > 1;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-sm px-6">
      {/* Tenant badge */}
      {currentTenant && (
        <div className="flex items-center gap-2 mr-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-sm font-medium text-slate-700 max-w-[160px] truncate">
              {currentTenant.name}
            </span>
            <span className={cn(
              'text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md',
              planCls[currentTenant.plan],
            )}>
              {currentTenant.plan}
            </span>
          </div>
          {canSwitchTenant && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSwitchTenant}
              className="h-8 px-2 text-slate-400 hover:text-slate-700"
              title="Cambiar tienda"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      <div className={cn('flex items-center gap-2', !currentTenant && 'ml-auto')}>
        <LocaleSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">
                {user?.firstName} {user?.lastName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-slate-600">
              <User className="mr-2 h-4 w-4" />
              <span className="truncate">{user?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-600">
              <span className="mr-2 h-4 w-4" />
              <span>{t('role')}: {user?.role}</span>
            </DropdownMenuItem>
            {canSwitchTenant && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSwitchTenant} className="text-slate-600">
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  <span>Cambiar tienda</span>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
