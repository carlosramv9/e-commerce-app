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

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex flex-col overflow-hidden rounded-r-2xl">
      {/* Base glass: semitransparente + blur tipo cristal esmerilado */}
      <div className="absolute inset-0 bg-white/25 backdrop-blur-2xl border-r border-white/20" />
      {/* Reflejo en borde izquierdo (luz sobre el cristal) */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-linear-to-r from-white/50 via-white/10 to-transparent"
      />
      {/* Brillo suave superior */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-linear-to-b from-white/25 via-white/5 to-transparent"
      />

      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-white/20 px-6">
          <h1 className="text-xl font-bold text-slate-800">Admin/POS</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <ul className="space-y-1">
            {visibleMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-slate-900/8 text-slate-800 border-l-2 border-slate-500/50 pl-[10px]'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {t(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        <div className="border-t border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/80">
              <span className="text-xs font-semibold text-slate-600">
                {user?.firstName.charAt(0)}
                {user?.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
