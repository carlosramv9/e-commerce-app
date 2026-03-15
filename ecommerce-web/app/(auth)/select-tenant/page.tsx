'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { TenantSummary, TenantPlan } from '@/lib/types';
import { Building2, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const planLabel: Record<TenantPlan, string> = {
  [TenantPlan.FREE]: 'Free',
  [TenantPlan.STARTER]: 'Starter',
  [TenantPlan.PRO]: 'Pro',
  [TenantPlan.PLUS]: 'Plus',
  [TenantPlan.ENTERPRISE]: 'Enterprise',
};

const planCls: Record<TenantPlan, string> = {
  [TenantPlan.FREE]: 'bg-slate-100 text-slate-500',
  [TenantPlan.STARTER]: 'bg-emerald-50 text-emerald-600',
  [TenantPlan.PRO]: 'bg-blue-50 text-blue-600',
  [TenantPlan.PLUS]: 'bg-violet-50 text-violet-600',
  [TenantPlan.ENTERPRISE]: 'bg-amber-50 text-amber-600',
};

const roleCls: Record<string, string> = {
  OWNER: 'text-amber-600',
  ADMIN: 'text-blue-600',
  MANAGER: 'text-violet-600',
  STAFF: 'text-slate-500',
};

export default function SelectTenantPage() {
  const router = useRouter();
  const { availableTenants, currentTenant, selectTenant, isAuthenticated } = useAuthStore();
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    // Already has a tenant — skip this page
    if (currentTenant) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, currentTenant, router]);

  const handleSelect = async (tenant: TenantSummary) => {
    try {
      setSelecting(tenant.slug);
      await selectTenant(tenant.slug);
      router.push('/dashboard');
    } catch {
      toast.error('No se pudo seleccionar la tienda');
      setSelecting(null);
    }
  };

  if (!availableTenants.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-4">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Selecciona tu tienda</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tu cuenta tiene acceso a {availableTenants.length} tienda{availableTenants.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-2">
        {availableTenants.map((tenant) => {
          const isLoading = selecting === tenant.slug;
          return (
            <button
              key={tenant.id}
              onClick={() => handleSelect(tenant)}
              disabled={!!selecting}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-2xl border bg-white/70 backdrop-blur-sm',
                'hover:border-slate-300 hover:bg-white/90 hover:shadow-sm',
                'transition-all text-left group',
                isLoading ? 'opacity-70' : 'border-slate-200/80',
              )}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                {isLoading
                  ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  : <Building2 className="h-5 w-5 text-slate-500" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-800 truncate">{tenant.name}</p>
                  <span className={cn('text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md', planCls[tenant.plan])}>
                    {planLabel[tenant.plan]}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-400 font-mono">{tenant.slug}</p>
                  <span className="text-slate-300">·</span>
                  <p className={cn('text-xs font-medium capitalize', roleCls[tenant.memberRole] ?? 'text-slate-500')}>
                    {tenant.memberRole.toLowerCase()}
                  </p>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 shrink-0 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
