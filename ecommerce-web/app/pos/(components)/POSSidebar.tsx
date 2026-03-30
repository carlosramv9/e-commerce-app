'use client';

import {
    ShoppingCart,
    ReceiptText,
    Users,
    Package,
    Tag,
    LogOut,
    Moon,
    Sun,
    ChevronUp,
    type LucideIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/lib/store/auth-store';
import BranchSelector from './BranchSelector';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';

export type POSSection = 'cobrar' | 'ventas' | 'clientes' | 'inventario' | 'promociones';

interface NavItem {
    id: POSSection;
    label: string;
    icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'cobrar', label: 'Cobrar', icon: ShoppingCart },
    { id: 'ventas', label: 'Mis ventas', icon: ReceiptText },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'promociones', label: 'Promociones', icon: Tag },
];

interface POSSidebarProps {
    activeSection: POSSection;
    onSectionChange: (section: POSSection) => void;
    cartCount: number;
    onExit: () => void;
    currentTime: Date;
}

function POSSidebarInner({
    activeSection,
    onSectionChange,
    cartCount,
    onExit,
    currentTime,
}: POSSidebarProps) {
    const user = useAuthStore((s) => s.user);
    const { state } = useSidebar();
    const { setTheme, resolvedTheme } = useTheme();
    const collapsed = state === 'collapsed';
    const isDark = resolvedTheme === 'dark';

    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?';
    const fullName = user ? `${user.firstName} ${user.lastName}` : '';

    return (
        <Sidebar collapsible="icon">
            {/* Header: brand + trigger */}
            <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 py-[14px] px-3 flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center shrink-0">
                        <ShoppingCart className="h-4 w-4 text-slate-500 dark:text-slate-300" strokeWidth={2.5} />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-slate-800 dark:text-slate-100 text-[20px] font-semibold leading-none tracking-tight truncate">
                                Terminal POS
                            </p>
                            <p className="text-slate-400 dark:text-slate-400 text-[16px] mt-0.5">Punto de venta</p>
                        </div>
                    )}
                </div>
                <SidebarTrigger className="shrink-0" />
            </SidebarHeader>

            {/* Navigation */}
            <SidebarContent>
                <SidebarMenu>
                    {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                        const active = activeSection === id;
                        return (
                            <SidebarMenuItem key={id}>
                                <SidebarMenuButton
                                    isActive={active}
                                    tooltip={label}
                                    onClick={() => onSectionChange(id)}
                                >
                                    {/* Icon + collapsed badge */}
                                    <span className="relative shrink-0">
                                        <Icon className="h-[20px] w-[20px]" />
                                        {id === 'cobrar' && cartCount > 0 && collapsed && (
                                            <span className="absolute -top-1.5 -right-1.5 h-[16px] w-[16px] rounded-full bg-slate-200 text-slate-600 dark:bg-[#37393D] dark:text-white/80 text-[10px] font-bold flex items-center justify-center">
                                                {cartCount > 9 ? '9+' : cartCount}
                                            </span>
                                        )}
                                    </span>

                                    {!collapsed && (
                                        <span className="text-[16px] font-medium truncate flex-1 text-slate-700 dark:text-white/80">
                                            {label}
                                        </span>
                                    )}

                                    {id === 'cobrar' && cartCount > 0 && !collapsed && (
                                        <SidebarMenuBadge>{cartCount}</SidebarMenuBadge>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t border-slate-200 dark:border-slate-800">
                {/* Clock */}
                {!collapsed && (
                    <div className="px-3 py-2">
                        <p className="text-slate-700 dark:text-slate-100 font-mono text-base font-semibold leading-none tabular-nums">
                            {currentTime.toLocaleTimeString('es-MX', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                        <p className="text-slate-400 dark:text-slate-400 text-[11px] mt-1 capitalize">
                            {currentTime.toLocaleDateString('es-MX', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'short',
                            })}
                        </p>
                    </div>
                )}

                <SidebarSeparator />

                {/* Branch selector */}
                {!collapsed && <BranchSelector />}

                {/* User menu with dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl hover:bg-slate-100 dark:hover:bg-white/6 transition-colors text-left">
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center shrink-0">
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-200">{initials}</span>
                            </div>
                            {!collapsed && (
                                <>
                                    <div className="overflow-hidden flex-1 min-w-0">
                                        <p className="text-slate-600 dark:text-slate-100 text-sm font-medium truncate leading-none">
                                            {fullName}
                                        </p>
                                        <p className="text-slate-400 dark:text-slate-400 text-xs mt-0.5">Vendedor</p>
                                    </div>
                                    <ChevronUp className="h-4 w-4 text-slate-400 dark:text-white/30 shrink-0" />
                                </>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start" className="w-56">
                        {/* Theme toggle */}
                        <DropdownMenuItem onClick={() => setTheme(isDark ? 'light' : 'dark')}>
                            {isDark ? (
                                <Sun className="h-4 w-4 text-amber-500" />
                            ) : (
                                <Moon className="h-4 w-4 text-slate-500" />
                            )}
                            <span>{isDark ? 'Tema claro' : 'Tema oscuro'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {/* Exit POS */}
                        <DropdownMenuItem onClick={onExit} className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300">
                            <LogOut className="h-4 w-4" />
                            <span>Salir del POS</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

export default function POSSidebar(props: POSSidebarProps) {
    return (
        <SidebarProvider defaultOpen={false}>
            <POSSidebarInner {...props} />
        </SidebarProvider>
    );
}
