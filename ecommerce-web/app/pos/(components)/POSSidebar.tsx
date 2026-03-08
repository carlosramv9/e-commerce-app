'use client';

import {
    ShoppingCart,
    ReceiptText,
    Users,
    Package,
    Tag,
    LogOut,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';

export type POSSection = 'cobrar' | 'ventas' | 'clientes' | 'inventario' | 'promociones';

interface NavItem {
    id: POSSection;
    label: string;
    icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'cobrar',      label: 'Cobrar',          icon: ShoppingCart },
    { id: 'ventas',      label: 'Mis ventas',       icon: ReceiptText  },
    { id: 'clientes',    label: 'Clientes',         icon: Users        },
    { id: 'inventario',  label: 'Inventario',       icon: Package      },
    { id: 'promociones', label: 'Promociones',      icon: Tag          },
];

interface POSSidebarProps {
    activeSection: POSSection;
    onSectionChange: (section: POSSection) => void;
    cartCount: number;
    onExit: () => void;
    currentTime: Date;
}

export default function POSSidebar({
    activeSection,
    onSectionChange,
    cartCount,
    onExit,
    currentTime,
}: POSSidebarProps) {
    const user = useAuthStore((s) => s.user);
    const initials = user
        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        : '?';
    const fullName = user ? `${user.firstName} ${user.lastName}` : '';

    return (
        <aside className="h-full w-14 lg:w-44 bg-[#0f1117] flex flex-col shrink-0 border-r border-white/[0.06]">
            {/* Brand */}
            <div className="flex items-center gap-3 px-3 lg:px-4 py-[18px] border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                    <ShoppingCart className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="hidden lg:block overflow-hidden">
                    <p className="text-white text-[13px] font-semibold leading-none tracking-tight">
                        Terminal POS
                    </p>
                    <p className="text-white/30 text-[11px] mt-0.5">Punto de venta</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                    const active = activeSection === id;
                    return (
                        <button
                            key={id}
                            onClick={() => onSectionChange(id)}
                            className={cn(
                                'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left',
                                active
                                    ? 'bg-white/[0.09] text-white'
                                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.05]',
                            )}
                        >
                            {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-400" />
                            )}

                            {/* Icon + mobile badge */}
                            <span className="relative shrink-0">
                                <Icon
                                    className={cn(
                                        'h-[18px] w-[18px]',
                                        active ? 'text-blue-400' : '',
                                    )}
                                />
                                {id === 'cobrar' && cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 h-[14px] w-[14px] rounded-full bg-blue-500 text-white text-[8px] font-bold flex items-center justify-center lg:hidden">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </span>

                            <span className="hidden lg:block text-[13px] font-medium truncate">
                                {label}
                            </span>

                            {/* Desktop cart badge */}
                            {id === 'cobrar' && cartCount > 0 && (
                                <span className="hidden lg:flex ml-auto h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold px-1.5 border border-blue-500/30">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-2 border-t border-white/[0.06] space-y-0.5">
                {/* Clock (desktop only) */}
                <div className="hidden lg:block px-3 py-2.5">
                    <p className="text-white font-mono text-base font-semibold leading-none tabular-nums">
                        {currentTime.toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                    <p className="text-white/30 text-[11px] mt-1 capitalize">
                        {currentTime.toLocaleDateString('es-MX', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'short',
                        })}
                    </p>
                </div>

                {/* User info */}
                <div className="flex items-center gap-2.5 px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-semibold text-white/60">
                            {initials}
                        </span>
                    </div>
                    <div className="hidden lg:block overflow-hidden flex-1 min-w-0">
                        <p className="text-white/60 text-xs font-medium truncate leading-none">
                            {fullName}
                        </p>
                        <p className="text-white/25 text-[10px] mt-0.5">Vendedor</p>
                    </div>
                </div>

                {/* Exit */}
                <button
                    onClick={onExit}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                >
                    <LogOut className="h-[17px] w-[17px] shrink-0" />
                    <span className="hidden lg:block text-[13px] font-medium">Salir del POS</span>
                </button>
            </div>
        </aside>
    );
}
