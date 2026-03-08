'use client';

import { useEffect, useState } from 'react';
import { couponsApi } from '@/lib/api/coupons';
import { Coupon } from '@/lib/types';
import { Loader2, Tag, Percent, Banknote, Users, ShoppingBag, Globe } from 'lucide-react';
import { currencyFormatter } from '@/lib/utils';

const SCOPE_STYLE: Record<string, { label: string; icon: typeof Globe }> = {
    GLOBAL:   { label: 'Todo el carrito', icon: Globe      },
    PRODUCT:  { label: 'Producto',        icon: ShoppingBag },
    CATEGORY: { label: 'Categoría',       icon: Tag         },
};

interface PromocionesSectionProps {
    onApply: () => void; // opens coupon modal
}

export default function PromocionesSection({ onApply }: PromocionesSectionProps) {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await couponsApi.getAll({ isActive: true, limit: 100 });
                const now = new Date();
                const active = (res.data.data ?? []).filter((c) => {
                    const start = new Date(c.startDate);
                    const end   = c.endDate ? new Date(c.endDate) : null;
                    const started    = start <= now;
                    const notExpired = !end || end >= now;
                    const hasUsage   = c.usageLimit == null || c.usageCount < c.usageLimit;
                    return started && notExpired && hasUsage;
                });
                setCoupons(active);
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b border-neutral-100 bg-white px-6 py-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-neutral-900">Promociones activas</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            {coupons.length} cupón{coupons.length !== 1 ? 'es' : ''} disponible{coupons.length !== 1 ? 's' : ''} hoy
                        </p>
                    </div>
                    <button
                        onClick={onApply}
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                    >
                        <Tag className="h-3.5 w-3.5" />
                        Aplicar cupón
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {coupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center">
                            <Tag className="h-6 w-6 text-neutral-300" />
                        </div>
                        <p className="text-sm font-medium text-neutral-400">
                            No hay promociones activas hoy
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {coupons.map((coupon) => {
                            const isPercent = coupon.type === 'PERCENTAGE';
                            const ValueIcon = isPercent ? Percent : Banknote;
                            const scope = SCOPE_STYLE[coupon.scope] ?? SCOPE_STYLE.GLOBAL;
                            const ScopeIcon = scope.icon;
                            const usagePct =
                                coupon.usageLimit
                                    ? Math.round((coupon.usageCount / coupon.usageLimit) * 100)
                                    : null;

                            return (
                                <div
                                    key={coupon.id}
                                    className="bg-white rounded-xl border border-neutral-100 overflow-hidden"
                                >
                                    {/* Top stripe */}
                                    <div
                                        className={`h-0.5 ${isPercent ? 'bg-purple-400' : 'bg-emerald-400'}`}
                                    />

                                    <div className="px-4 py-3.5 flex items-start gap-3">
                                        {/* Icon */}
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                                isPercent
                                                    ? 'bg-purple-50 border-purple-100 text-purple-500'
                                                    : 'bg-emerald-50 border-emerald-100 text-emerald-500'
                                            }`}
                                        >
                                            <ValueIcon className="h-4 w-4" />
                                        </div>

                                        {/* Body */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-mono font-bold text-sm text-neutral-900 tracking-wider">
                                                        {coupon.code}
                                                    </p>
                                                    {coupon.description && (
                                                        <p className="text-xs text-neutral-500 mt-0.5">
                                                            {coupon.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <p
                                                    className={`font-bold text-base shrink-0 ${
                                                        isPercent ? 'text-purple-600' : 'text-emerald-600'
                                                    }`}
                                                >
                                                    {isPercent
                                                        ? `${Number(coupon.value)}% OFF`
                                                        : `−${currencyFormatter.format(Number(coupon.value))}`}
                                                </p>
                                            </div>

                                            {/* Meta pills */}
                                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                                                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                                                    <ScopeIcon className="h-3 w-3" />
                                                    {scope.label}
                                                </span>
                                                {coupon.minPurchase && (
                                                    <span className="text-[11px] text-neutral-400">
                                                        Mín. {currencyFormatter.format(Number(coupon.minPurchase))}
                                                    </span>
                                                )}
                                                {coupon.maxDiscount && isPercent && (
                                                    <span className="text-[11px] text-neutral-400">
                                                        Máx. {currencyFormatter.format(Number(coupon.maxDiscount))}
                                                    </span>
                                                )}
                                                {coupon.endDate && (
                                                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                                                        Vence{' '}
                                                        {new Date(coupon.endDate).toLocaleDateString('es-MX', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                    </span>
                                                )}
                                                {coupon.customerTypes?.length > 0 && (
                                                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {coupon.customerTypes.join(', ')}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Usage bar */}
                                            {usagePct !== null && (
                                                <div className="mt-2">
                                                    <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                usagePct > 80
                                                                    ? 'bg-amber-400'
                                                                    : 'bg-emerald-400'
                                                            }`}
                                                            style={{ width: `${usagePct}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-neutral-400 mt-0.5">
                                                        {coupon.usageCount}/{coupon.usageLimit} usos
                                                    </p>
                                                </div>
                                            )}
                                        </div>
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
