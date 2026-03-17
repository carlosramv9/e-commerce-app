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
import { useAuthStore } from '@/lib/store/auth-store';
import BranchSelector from './BranchSelector';
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
    const collapsed = state === 'collapsed';

    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?';
    const fullName = user ? `${user.firstName} ${user.lastName}` : '';

    return (
        <Sidebar collapsible="icon">
            {/* Header: brand + trigger */}
            <SidebarHeader className="border-b border-slate-200 py-[14px] px-3 flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <ShoppingCart className="h-4 w-4 text-slate-500" strokeWidth={2.5} />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-slate-800 text-[20px] font-semibold leading-none tracking-tight truncate">
                                Terminal POS
                            </p>
                            <p className="text-slate-400 text-[16px] mt-0.5">Punto de venta</p>
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
                                            <span className="absolute -top-1.5 -right-1.5 h-[16px] w-[16px] rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                                                {cartCount > 9 ? '9+' : cartCount}
                                            </span>
                                        )}
                                    </span>

                                    {!collapsed && (
                                        <span className="text-[16px] font-medium truncate flex-1">
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
            <SidebarFooter className="border-t border-slate-200">
                {/* Clock */}
                {!collapsed && (
                    <div className="px-3 py-2">
                        <p className="text-slate-700 font-mono text-base font-semibold leading-none tabular-nums">
                            {currentTime.toLocaleTimeString('es-MX', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                        <p className="text-slate-400 text-[11px] mt-1 capitalize">
                            {currentTime.toLocaleDateString('es-MX', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'short',
                            })}
                        </p>
                    </div>
                )}

                <SidebarSeparator />

                {/* User info */}
                <div className="flex items-center gap-2.5 px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-semibold text-slate-500">{initials}</span>
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden flex-1 min-w-0">
                            <p className="text-slate-600 text-sm font-medium truncate leading-none">
                                {fullName}
                            </p>
                            <p className="text-slate-400 text-xs mt-0.5">Vendedor</p>
                        </div>
                    )}
                </div>

                {/* Branch selector */}
                {!collapsed && <BranchSelector />}

                {/* Exit */}
                <SidebarMenuButton tooltip="Salir del POS" onClick={onExit} className="text-red-600 hover:text-red-700">
                    <LogOut className="h-[20px] w-[20px] shrink-0" />
                    {!collapsed && (
                        <span className="text-[18px] font-medium">Salir del POS</span>
                    )}
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    );
}

export default function POSSidebar(props: POSSidebarProps) {
    return (
        <SidebarProvider defaultOpen={true}>
            <POSSidebarInner {...props} />
        </SidebarProvider>
    );
}
