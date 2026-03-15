import { Customer } from '@/lib/types';
import React, { useMemo, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Search, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';

const CustomerModal = ({
    open,
    onClose,
    customers,
    selectedCustomer,
    onSelectCustomer,
    onNewCustomer,
}: {
    open: boolean;
    onClose: () => void;
    customers: Customer[];
    selectedCustomer: string;
    onSelectCustomer: (id: string) => void;
    onNewCustomer: () => void;
}) => {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search) return customers;
        const q = search.toLowerCase();
        return customers.filter(
            (c) =>
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.phone && c.phone.includes(q))
        );
    }, [customers, search]);

    const handleSelect = (id: string) => {
        onSelectCustomer(id);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-5 pt-5 pb-4 border-b border-white/40">
                    <DialogTitle className="text-base font-semibold">Seleccionar Cliente</DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="px-4 py-3 border-b border-white/40">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre, email o teléfono..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-10 text-sm border-white/50 bg-white/60 focus:ring-slate-300/60"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Customer list */}
                <div className="overflow-y-auto max-h-[340px]">
                    {filtered.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-sm text-slate-400">
                            No se encontraron clientes
                        </div>
                    ) : (
                        filtered.map((customer) => {
                            const isSelected = customer.id === selectedCustomer;
                            return (
                                <button
                                    key={customer.id}
                                    onClick={() => handleSelect(customer.id)}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/50 transition-colors border-b border-white/40 last:border-0 ${isSelected ? 'bg-slate-100/60' : ''
                                        }`}
                                >
                                    <div className="w-9 h-9 rounded-full bg-slate-100/80 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-semibold text-slate-600">
                                            {customer.firstName[0]}{customer.lastName[0]}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">
                                            {customer.firstName} {customer.lastName}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">{customer.email}</p>
                                    </div>
                                    {isSelected && (
                                        <Check className="h-4 w-4 text-slate-600 shrink-0" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* New customer button */}
                <div className="border-t border-white/40 p-4 bg-white/20 backdrop-blur-sm">
                    <button
                        onClick={() => { onNewCustomer(); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-white/50 hover:border-slate-300 hover:bg-white/50 transition-all text-left"
                    >
                        <div className="w-9 h-9 rounded-full bg-slate-100/80 flex items-center justify-center shrink-0">
                            <UserPlus className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Registrar nuevo cliente</p>
                            <p className="text-xs text-slate-400">Ir al formulario de alta</p>
                        </div>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CustomerModal
