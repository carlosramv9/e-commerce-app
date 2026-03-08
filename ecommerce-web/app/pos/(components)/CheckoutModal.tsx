'use client';

import { AppliedCoupon } from '@/lib/interfaces/appliedCoupon';
import { CartItem } from '@/lib/interfaces/cart-item';
import { Customer } from '@/lib/types';
import React, { useState, useMemo, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { currencyFormatter } from '@/lib/utils';
import { ArrowLeftRight, Banknote, CreditCard, Loader2, Plus, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type PaymentSplit = {
    method: string;
    amount: number;
};

const PAYMENT_METHODS = [
    { id: 'CASH', label: 'Efectivo', icon: Banknote },
    { id: 'CARD', label: 'Tarjeta', icon: CreditCard },
    { id: 'TRANSFER', label: 'Transferencia', icon: ArrowLeftRight },
] as const;

type SplitRow = {
    id: string;
    method: string;
    amount: string;
    /** Si true, el monto se calcula como (total - resto de splits) */
    isRemaining?: boolean;
};

const MAX_SPLITS = 3;

function newRow(method: string, amount: number, isRemaining = false): SplitRow {
    return {
        id: Date.now().toString() + Math.random(),
        method,
        amount: amount.toFixed(2),
        ...(isRemaining && { isRemaining: true }),
    };
}

const CheckoutModal = ({
    open,
    onClose,
    cart,
    customer,
    appliedCoupons,
    subtotal,
    discount,
    total,
    onConfirm,
    confirming,
}: {
    open: boolean;
    onClose: () => void;
    cart: CartItem[];
    customer: Customer | undefined;
    appliedCoupons: AppliedCoupon[];
    subtotal: number;
    discount: number;
    total: number;
    onConfirm: (payments: PaymentSplit[]) => Promise<void>;
    confirming: boolean;
}) => {
    const [splits, setSplits] = useState<SplitRow[]>([newRow('CASH', total)]);

    // Reset when modal opens (defer setState to avoid synchronous update in effect)
    useEffect(() => {
        if (open) {
            const t = setTimeout(() => setSplits([newRow('CASH', total)]), 0);
            return () => clearTimeout(t);
        }
    }, [open, total]);

    /** Monto efectivo de cada split (si isRemaining, se calcula después en totalPaid) */
    const splitAmounts = useMemo(() => {
        const fixedTotal = splits
            .filter((s) => !s.isRemaining)
            .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
        const remainingCount = splits.filter((s) => s.isRemaining).length;
        const remainder = Math.round((total - fixedTotal) * 100) / 100;
        const remainingPerSplit =
            remainingCount > 0 ? Math.round((remainder / remainingCount) * 100) / 100 : 0;
        return splits.map((s) =>
            s.isRemaining ? remainingPerSplit : parseFloat(s.amount) || 0
        );
    }, [splits, total]);

    const totalPaid = useMemo(
        () => splitAmounts.reduce((sum, a) => sum + a, 0),
        [splitAmounts],
    );

    const remaining = Math.round((total - totalPaid) * 100) / 100;
    const hasNegativeSplit = splitAmounts.some((a) => a < -0.01);
    const isValid =
        Math.abs(remaining) < 0.01 && !hasNegativeSplit;
    const isMultiple = splits.length > 1;

    const addSplit = () => {
        if (splits.length >= MAX_SPLITS) return;
        const newCount = splits.length + 1;
        const perAmount = Math.floor((total / newCount) * 100) / 100;
        const firstAmount = Math.round((total - perAmount * (newCount - 1)) * 100) / 100;
        setSplits((prev) => {
            // Pick a method not already used, default CARD → TRANSFER → CASH
            const usedMethods = prev.map((s) => s.method);
            const nextMethod =
                PAYMENT_METHODS.find((m) => !usedMethods.includes(m.id))?.id ?? 'CARD';
            const withNew = [...prev, { id: newRow(nextMethod, 0).id, method: nextMethod, amount: '0' }];
            return withNew.map((s, i) => ({
                ...s,
                amount: i === 0 ? firstAmount.toFixed(2) : perAmount.toFixed(2),
            }));
        });
    };

    const removeSplit = (id: string) => {
        setSplits((prev) => prev.filter((s) => s.id !== id));
    };

    const updateMethod = (id: string, method: string) => {
        setSplits((prev) => prev.map((s) => (s.id === id ? { ...s, method } : s)));
    };

    const updateAmount = (id: string, value: string) => {
        setSplits((prev) =>
            prev.map((s) => (s.id === id ? { ...s, amount: value, isRemaining: false } : s))
        );
    };

    const toggleRemainingSplit = (id: string) => {
        setSplits((prev) =>
            prev.map((s) => {
                if (s.id !== id) return s;
                if (s.isRemaining) {
                    return { ...s, isRemaining: false, amount: '0' };
                }
                return { ...s, isRemaining: true, amount: '0' };
            })
        );
    };

    const handleConfirm = async () => {
        if (!isValid || confirming) return;
        if (splitAmounts.some((a) => a < 0)) return;
        const payload = splits.map((s, i) => ({
            method: s.method,
            amount: splitAmounts[i] ?? 0,
        }));
        await onConfirm(payload);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-5 pt-5 pb-4 border-b border-neutral-100">
                    <DialogTitle className="text-base font-semibold">Resumen de Venta</DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[70vh]">
                    {/* Customer */}
                    {customer && (
                        <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold text-neutral-600">
                                    {customer.firstName[0]}{customer.lastName[0]}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-900">
                                    {customer.firstName} {customer.lastName}
                                </p>
                                <p className="text-xs text-neutral-500">{customer.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Items */}
                    <div className="px-5 py-4 border-b border-neutral-100">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                            Productos ({cart.length})
                        </p>
                        <div className="space-y-2.5">
                            {cart.map((item) => (
                                <div key={item.product.id} className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-neutral-900 truncate">{item.product.name}</p>
                                        <p className="text-xs text-neutral-500 font-mono">
                                            {item.quantity} × {currencyFormatter.format(item.product.price)}
                                        </p>
                                    </div>
                                    <p className="text-sm font-mono font-semibold text-neutral-900 shrink-0">
                                        {currencyFormatter.format(item.product.price * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="px-5 py-4 border-b border-neutral-100 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Subtotal</span>
                            <span className="font-mono text-neutral-900">{currencyFormatter.format(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-600 flex items-center gap-1.5">
                                    <Tag className="h-3 w-3" />
                                    {appliedCoupons.map((c) => c.code).join(', ')}
                                </span>
                                <span className="font-mono text-emerald-600">−{currencyFormatter.format(discount)}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between">
                            <span className="font-semibold text-neutral-900">Total</span>
                            <span className="font-mono font-bold text-xl text-neutral-900">{currencyFormatter.format(total)}</span>
                        </div>
                    </div>

                    {/* Payment section */}
                    <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                                {isMultiple ? 'Pago Dividido' : 'Método de Pago'}
                            </p>
                            {splits.length < MAX_SPLITS && (
                                <button
                                    onClick={addSplit}
                                    className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Dividir pago
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {splits.map((split, index) => (
                                <div
                                    key={split.id}
                                    className="rounded-xl border border-neutral-200 p-3 bg-neutral-50/60"
                                >
                                    {/* Split header (only in multi-split mode) */}
                                    {isMultiple && (
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                                Pago {index + 1}
                                            </span>
                                            {index > 0 && (
                                                <button
                                                    onClick={() => removeSplit(split.id)}
                                                    className="text-neutral-300 hover:text-red-400 transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Method pills + Resto aquí */}
                                    <div className="flex gap-1.5 flex-wrap mb-2.5">
                                        {PAYMENT_METHODS.map((m) => {
                                            const Icon = m.icon;
                                            const selected = split.method === m.id;
                                            return (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => updateMethod(split.id, m.id)}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                                        selected
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                                                    }`}
                                                >
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {m.label}
                                                </button>
                                            );
                                        })}
                                        {isMultiple && (
                                            <button
                                                type="button"
                                                onClick={() => toggleRemainingSplit(split.id)}
                                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                                    split.isRemaining
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                        : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                                                }`}
                                            >
                                                {split.isRemaining ? 'Quitar resto' : 'Resto aquí'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Amount: input o monto calculado (resto) */}
                                    {isMultiple && (
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 pointer-events-none select-none">
                                                $
                                            </span>
                                            {split.isRemaining ? (
                                                <div>
                                                    <div
                                                        className={`w-full pl-6 pr-3 py-2 border rounded-lg text-sm font-mono ${
                                                            (splitAmounts[index] ?? 0) < -0.01
                                                                ? 'border-red-300 bg-red-50/80 text-red-800'
                                                                : 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
                                                        }`}
                                                    >
                                                        {(splitAmounts[index] ?? 0).toFixed(2)}
                                                        <span className="ml-2 text-[10px] font-medium uppercase tracking-wide">
                                                            {(splitAmounts[index] ?? 0) < -0.01 ? '(excede)' : '(resto)'}
                                                        </span>
                                                    </div>
                                                    {(splitAmounts[index] ?? 0) < -0.01 && (
                                                        <p className="mt-1.5 text-xs text-red-600 font-medium">
                                                            El monto asignado supera el total a pagar
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={split.amount}
                                                    onChange={(e) => updateAmount(split.id, e.target.value)}
                                                    className="w-full pl-6 pr-3 py-2 border border-neutral-200 rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Remaining indicator */}
                        {isMultiple && (
                            <div
                                className={`mt-3 flex items-center justify-between text-sm px-1 transition-colors ${
                                    remaining > 0.01
                                        ? 'text-amber-600'
                                        : remaining < -0.01
                                        ? 'text-red-500'
                                        : 'text-emerald-600'
                                }`}
                            >
                                <span className="font-medium">
                                    {remaining > 0.01
                                        ? 'Restante por asignar'
                                        : remaining < -0.01
                                        ? 'Excede el total'
                                        : '✓ Monto cubierto'}
                                </span>
                                {Math.abs(remaining) >= 0.01 && (
                                    <span className="font-mono font-semibold tabular-nums">
                                        {currencyFormatter.format(Math.abs(remaining))}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-neutral-100 px-5 py-4 flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                        disabled={confirming}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 font-semibold"
                        onClick={handleConfirm}
                        disabled={confirming || !isValid}
                    >
                        {confirming ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            'Confirmar Venta'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CheckoutModal;
