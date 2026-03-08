'use client';

import { useMemo, useState } from 'react';
import { Product } from '@/lib/types';
import { Search, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { currencyFormatter } from '@/lib/utils';

type StockFilter = 'all' | 'low' | 'out';

interface InventarioSectionProps {
    products: Product[];
}

export default function InventarioSection({ products }: InventarioSectionProps) {
    const [search, setSearch]   = useState('');
    const [filter, setFilter]   = useState<StockFilter>('all');

    const lowStockCount = products.filter(
        (p) => p.stock > 0 && p.stock <= (p.lowStockAlert ?? 5),
    ).length;
    const outCount = products.filter((p) => p.stock === 0).length;

    const filtered = useMemo(() => {
        let list = [...products];
        if (filter === 'low') list = list.filter((p) => p.stock > 0 && p.stock <= (p.lowStockAlert ?? 5));
        else if (filter === 'out') list = list.filter((p) => p.stock === 0);
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.sku.toLowerCase().includes(q),
            );
        }
        // Sort: out first, then low, then ok
        list.sort((a, b) => {
            const score = (p: Product) => (p.stock === 0 ? 0 : p.stock <= (p.lowStockAlert ?? 5) ? 1 : 2);
            return score(a) - score(b);
        });
        return list;
    }, [products, search, filter]);

    const FILTERS: Array<{ id: StockFilter; label: string; count?: number }> = [
        { id: 'all', label: 'Todos', count: products.length },
        { id: 'low', label: 'Stock bajo', count: lowStockCount },
        { id: 'out', label: 'Agotados',  count: outCount },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b border-neutral-100 bg-white px-6 py-4 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base font-semibold text-neutral-900">Inventario</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            Vista de stock — solo lectura
                        </p>
                    </div>
                    {(lowStockCount > 0 || outCount > 0) && (
                        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">
                                {outCount > 0 && `${outCount} agotado${outCount > 1 ? 's' : ''}`}
                                {outCount > 0 && lowStockCount > 0 && ' · '}
                                {lowStockCount > 0 && `${lowStockCount} bajo stock`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Filter pills */}
                <div className="flex gap-2 mb-3">
                    {FILTERS.map(({ id, label, count }) => (
                        <button
                            key={id}
                            onClick={() => setFilter(id)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                                filter === id
                                    ? 'bg-neutral-900 text-white border-neutral-900'
                                    : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                            }`}
                        >
                            {label}
                            {count !== undefined && (
                                <span
                                    className={`ml-1.5 text-[10px] font-bold ${
                                        filter === id ? 'text-white/60' : 'text-neutral-400'
                                    }`}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Buscar por nombre o SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-sm border-neutral-200"
                    />
                </div>
            </div>

            {/* Product list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-neutral-300" />
                        </div>
                        <p className="text-sm font-medium text-neutral-400">Sin productos</p>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {filtered.map((product) => {
                            const isOut  = product.stock === 0;
                            const isLow  = !isOut && product.stock <= (product.lowStockAlert ?? 5);
                            const isOk   = !isOut && !isLow;

                            const stockStyle = isOut
                                ? 'text-red-600 bg-red-50 border-red-200'
                                : isLow
                                ? 'text-amber-600 bg-amber-50 border-amber-200'
                                : 'text-emerald-600 bg-emerald-50 border-emerald-200';

                            const StockIcon = isOk ? CheckCircle2 : AlertTriangle;

                            return (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-xl border border-neutral-100 px-4 py-3 flex items-center gap-3"
                                >
                                    {/* Stock icon */}
                                    <div
                                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${stockStyle}`}
                                    >
                                        <StockIcon className="h-4 w-4" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 truncate">
                                            {product.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[11px] text-neutral-400 font-mono">
                                                {product.sku}
                                            </span>
                                            <span className="text-[11px] text-neutral-300">·</span>
                                            <span className="text-[11px] text-neutral-500 font-medium">
                                                {currencyFormatter.format(Number(product.price))}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stock badge */}
                                    <div
                                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border shrink-0 ${stockStyle}`}
                                    >
                                        {isOut ? 'Agotado' : `${product.stock} uds`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
