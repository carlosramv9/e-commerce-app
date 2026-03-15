'use client';

import { useEffect, useState } from 'react';
import { ordersApi } from '@/lib/api/orders';
import { Order } from '@/lib/types';
import { Loader2, ReceiptText, Clock3, TrendingUp } from 'lucide-react';
import { currencyFormatter } from '@/lib/utils';

const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
    PAID:     { label: 'Pagado',    cls: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/80' },
    PENDING:  { label: 'Pendiente', cls: 'text-amber-700  bg-amber-50/80  border-amber-200/80'  },
    REFUNDED: { label: 'Devuelto',  cls: 'text-slate-600  bg-slate-100    border-slate-200'    },
    FAILED:   { label: 'Fallido',   cls: 'text-red-600    bg-red-50/80    border-red-200/80'    },
};

const METHOD_LABEL: Record<string, string> = {
    CASH:     'Efectivo',
    CARD:     'Tarjeta',
    TRANSFER: 'Transferencia',
};

export default function VentasSection() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await ordersApi.getAll({ limit: 100, page: 1 });
                const today = new Date().toDateString();
                const todayOrders = (res.data.data ?? []).filter(
                    (o) => new Date(o.createdAt).toDateString() === today,
                );
                // Most recent first
                todayOrders.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                );
                setOrders(todayOrders);
            } catch {
                // silent — not critical
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const totalPaid = orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + Number(o.total), 0);

    const paidCount    = orders.filter((o) => o.paymentStatus === 'PAID').length;
    const pendingCount = orders.filter((o) => o.paymentStatus === 'PENDING').length;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b border-slate-100/80 bg-white/60 backdrop-blur-sm px-6 py-4 shrink-0">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">Mis ventas de hoy</h2>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">
                            {new Date().toLocaleDateString('es-MX', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                            })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400">Total cobrado</p>
                        <p className="text-xl font-bold font-mono text-slate-800 tabular-nums">
                            {currencyFormatter.format(totalPaid)}
                        </p>
                    </div>
                </div>

                {/* Summary pills */}
                <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-white/60 rounded-xl px-3 py-2.5 text-center border border-slate-200/60">
                        <p className="text-lg font-bold text-slate-800 tabular-nums">{orders.length}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Total ventas</p>
                    </div>
                    <div className="bg-emerald-50/60 rounded-xl px-3 py-2.5 text-center border border-emerald-200/60">
                        <p className="text-lg font-bold text-emerald-700 tabular-nums">{paidCount}</p>
                        <p className="text-[11px] text-emerald-600 mt-0.5">Pagadas</p>
                    </div>
                    <div className="bg-amber-50/60 rounded-xl px-3 py-2.5 text-center border border-amber-200/60">
                        <p className="text-lg font-bold text-amber-700 tabular-nums">{pendingCount}</p>
                        <p className="text-[11px] text-amber-600 mt-0.5">Pendientes</p>
                    </div>
                </div>
            </div>

            {/* Order list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-400">
                            Aún no hay ventas registradas hoy
                        </p>
                        <p className="text-xs text-slate-300">
                            Tus ventas del día aparecerán aquí
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {orders.map((order) => {
                            const status =
                                PAYMENT_STATUS[order.paymentStatus] ?? {
                                    label: order.paymentStatus,
                                    cls: 'text-slate-500 bg-slate-100 border-slate-200',
                                };
                            const time = new Date(order.createdAt).toLocaleTimeString('es-MX', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });
                            const payments = (order as any).payments as Array<{
                                paymentMethod: string;
                                amount: number;
                            }> | undefined;
                            const methodLabel =
                                payments && payments.length > 0
                                    ? payments
                                          .map((p) => METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod)
                                          .join(' + ')
                                    : '—';

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/60 px-4 py-3 flex items-center gap-3 hover:bg-white/80 hover:border-slate-300/60 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center shrink-0">
                                        <ReceiptText className="h-[17px] w-[17px] text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-800 font-mono tracking-tight">
                                                {order.orderNumber}
                                            </p>
                                            <span
                                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0 ${status.cls}`}
                                            >
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                                            {order.customer
                                                ? `${order.customer.firstName} ${order.customer.lastName}`
                                                : 'Público general'}{' '}
                                            · {methodLabel}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold font-mono text-slate-800 tabular-nums">
                                            {currencyFormatter.format(Number(order.total))}
                                        </p>
                                        <p className="text-[11px] text-slate-400 flex items-center gap-0.5 justify-end mt-0.5">
                                            <Clock3 className="h-3 w-3" />
                                            {time}
                                        </p>
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
