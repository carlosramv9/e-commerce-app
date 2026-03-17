'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  Shield,
  ShieldCheck,
  Store,
  Building2,
} from 'lucide-react';
import { useAuthStore, canManageUsers } from '@/lib/store/auth-store';
import { useTranslations } from 'next-intl';

type MenuItemKey =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'pos'
  | 'customers'
  | 'coupons'
  | 'users'
  | 'roles'
  | 'branches';

const menuItems: { key: MenuItemKey; href: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'products', href: '/products', icon: Package },
  { key: 'categories', href: '/categories', icon: FolderTree },
  { key: 'orders', href: '/orders', icon: ShoppingCart },
  { key: 'pos', href: '/pos', icon: Store },
  { key: 'customers', href: '/customers', icon: Users },
  { key: 'coupons', href: '/coupons', icon: Ticket },
  { key: 'users', href: '/users', icon: Shield, adminOnly: true },
  { key: 'roles', href: '/roles', icon: ShieldCheck, adminOnly: true },
  { key: 'branches', href: '/settings/branches', icon: Building2, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const t = useTranslations('nav');

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.adminOnly) return canManageUsers(user);
    return true;
  });

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '?';

  return (
    <aside className={cn("fixed left-0 top-0 z-40 h-screen w-64 flex flex-col overflow-hidden backdrop-blur-[10px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-800 ease-cubic-bezier(0.4,0,0.2,1)",
      "dark:bg-[linear-gradient(145deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.03)_100%)]",
      "bg-[linear-gradient(135deg,rgba(255,255,255,0.01)_0%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.07)_100%)]")}>


      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        {/* ── Logo ───────────────────────────────────────────── */}
        <div className="flex h-16 items-center px-5 border-b border-white/10 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center ring-1 ring-indigo-500/30 dark:ring-white/30 dark:bg-white/10">
              <Store className="h-4 w-4 text-indigo-400 dark:text-white" />
            </div>
            <h1 className="text-[20px] font-bold text-slate-800 dark:text-white tracking-tight">
              Admin/POS
            </h1>
          </div>
        </div>

        {/* ── Navigation ─────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-0.5">
            {visibleMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? [
                          // Light active
                          'bg-slate-900/8 text-slate-800',
                          // Dark active — bg neutro blanco sutil (como en screenshot)
                          'dark:bg-white/10 dark:text-white',
                          '[&_svg]:text-slate-600 [&_svg]:dark:text-white',
                        ].join(' ')
                        : [
                          // Light inactive
                          'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5',
                          // Dark inactive
                          'dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5',
                          '[&_svg]:text-slate-400 [&_svg]:dark:text-slate-500 [&_svg]:dark:hover:text-slate-300',
                        ].join(' ')
                    )}
                  >
                    <Icon className="h-[22px] w-[22px] shrink-0 dark:text-white dark:invert" />
                    <span className="dark:text-white/80">{t(item.key)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── User footer ────────────────────────────────────── */}
        <div className="px-3 py-3 border-t border-white/10 dark:border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 dark:hover:bg-white/4 transition-colors cursor-pointer">
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                            bg-slate-200 dark:bg-[#7b7e89]/60 ring-1 ring-slate-300/50 dark:ring-white/10">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-200 leading-none">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[20px] font-medium text-slate-800 dark:text-white truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[14px] text-slate-400 dark:text-white/70 truncate leading-tight mt-0.5 uppercase tracking-wide">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
