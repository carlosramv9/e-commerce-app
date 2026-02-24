import { AppliedCoupon } from '@/lib/interfaces/appliedCoupon';
import { CartItem } from '@/lib/interfaces/cart-item';
import { Customer } from '@/lib/types';
import React, { useState } from 'react'
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { currencyFormatter } from '@/lib/utils';
import { ArrowLeftRight, Banknote, CreditCard, Loader2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PAYMENT_METHODS = [
    {
        id: 'CASH',
        label: 'Efectivo',
        icon: Banknote,
        description: 'Pago en efectivo',
    },
    {
        id: 'CARD',
        label: 'Tarjeta',
        icon: CreditCard,
        description: 'Crédito o débito',
    },
    {
        id: 'TRANSFER',
        label: 'Transferencia',
        icon: ArrowLeftRight,
        description: 'Transferencia bancaria',
    },
] as const;

const CheckoutModal = ({
    open,
    onClose,
    cart,
    customer,
    appliedCoupons,
    subtotal,
    discount,
    tax,
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
    tax: number;
    total: number;
    onConfirm: (paymentMethod: string) => Promise<void>;
    confirming: boolean;
}) => {
    const [paymentMethod, setPaymentMethod] = useState('CASH');

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
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">IVA (16%)</span>
                            <span className="font-mono text-neutral-900">{currencyFormatter.format(tax)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="font-semibold text-neutral-900">Total</span>
                            <span className="font-mono font-bold text-xl text-neutral-900">{currencyFormatter.format(total)}</span>
                        </div>
                    </div>

                    {/* Payment method */}
                    <div className="px-5 py-4">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                            Método de Pago
                        </p>
                        <div className="grid grid-cols-3 gap-2.5">
                            {PAYMENT_METHODS.map((method) => {
                                const Icon = method.icon;
                                const isSelected = paymentMethod === method.id;
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${isSelected
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                                            }`}
                                    >
                                        <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-neutral-500'}`} />
                                        <span className="text-xs font-semibold">{method.label}</span>
                                        <span className={`text-[10px] leading-tight text-center ${isSelected ? 'text-blue-500' : 'text-neutral-400'}`}>
                                            {method.description}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
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
                        onClick={() => onConfirm(paymentMethod)}
                        disabled={confirming}
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
}

export default CheckoutModal