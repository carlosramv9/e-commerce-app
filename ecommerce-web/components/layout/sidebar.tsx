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
  | 'roles';

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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold text-gray-900">Admin/POS</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {visibleMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {t(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
              <span className="text-xs font-medium text-gray-600">
                {user?.firstName.charAt(0)}
                {user?.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
