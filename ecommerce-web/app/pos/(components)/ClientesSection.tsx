'use client';

import { useState } from 'react';
import { Customer } from '@/lib/types';
import { Search, Users, CheckCircle2, UserPlus, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { currencyFormatter } from '@/lib/utils';

const TYPE_STYLE: Record<string, { label: string; cls: string }> = {
    VIP:       { label: 'VIP',        cls: 'text-slate-700 bg-slate-100    border-slate-200'    },
    WHOLESALE: { label: 'Mayorista',  cls: 'text-slate-600 bg-slate-100/80 border-slate-200/80'  },
    REGULAR:   { label: 'Regular',    cls: 'text-slate-500 bg-slate-100/60 border-slate-200/60'  },
    NEW:       { label: 'Nuevo',      cls: 'text-slate-400 bg-slate-50     border-slate-200/40'  },
};

interface ClientesSectionProps {
    customers: Customer[];
    selectedCustomerId: string;
    onSelectCustomer: (id: string) => void;
    onNewCustomer: () => void;
    onSelectionDone: () => void; // goes back to cobrar after selecting
}

export default function ClientesSection({
    customers,
    selectedCustomerId,
    onSelectCustomer,
    onNewCustomer,
    onSelectionDone,
}: ClientesSectionProps) {
    const [search, setSearch] = useState('');

    const filtered = customers.filter((c) => {
        const q = search.toLowerCase();
        return (
            c.firstName.toLowerCase().includes(q) ||
            c.lastName.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.phone ?? '').includes(q)
        );
    });

    const handleSelect = (id: string) => {
        onSelectCustomer(selectedCustomerId === id ? '' : id);
        if (selectedCustomerId !== id) onSelectionDone();
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b border-slate-100/80 bg-white/60 backdrop-blur-sm px-6 py-4 shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">Clientes</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {customers.length} registrados · selecciona para agregar a la venta
                        </p>
                    </div>
                    <button
                        onClick={onNewCustomer}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100/80 hover:bg-slate-200/60 px-3 py-1.5 rounded-lg transition-colors border border-slate-200/60"
                    >
                        <UserPlus className="h-3.5 w-3.5" />
                        Nuevo
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-sm bg-white/60 border-slate-200/80"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center">
                            <Users className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-400">
                            {search ? 'Sin resultados' : 'No hay clientes registrados'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {filtered.map((customer) => {
                            const isSelected = customer.id === selectedCustomerId;
                            const type = TYPE_STYLE[customer.type] ?? TYPE_STYLE.NEW;
                            const initials = `${customer.firstName[0]}${customer.lastName[0]}`.toUpperCase();

                            return (
                                <button
                                    key={customer.id}
                                    onClick={() => handleSelect(customer.id)}
                                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                                        isSelected
                                            ? 'bg-slate-100/80 border-slate-300/60 shadow-sm shadow-slate-900/5'
                                            : 'bg-white/50 border-slate-200/50 hover:border-slate-300/50 hover:bg-white/70'
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                                            isSelected
                                                ? 'bg-slate-200/80 text-slate-700'
                                                : 'bg-slate-100/80 text-slate-500'
                                        }`}
                                    >
                                        {initials}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-slate-800 truncate">
                                                {customer.firstName} {customer.lastName}
                                            </p>
                                            <span
                                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0 ${type.cls}`}
                                            >
                                                {type.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                                                <Mail className="h-3 w-3 shrink-0" />
                                                {customer.email}
                                            </span>
                                            {customer.phone && (
                                                <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                                                    <Phone className="h-3 w-3" />
                                                    {customer.phone}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-300 mt-0.5">
                                            {customer.totalOrders} compras ·{' '}
                                            {currencyFormatter.format(Number(customer.totalSpent))} total
                                        </p>
                                    </div>

                                    {isSelected ? (
                                        <CheckCircle2 className="h-4 w-4 text-slate-600 shrink-0" />
                                    ) : (
                                        <span className="text-[11px] text-slate-300 shrink-0">Seleccionar</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
