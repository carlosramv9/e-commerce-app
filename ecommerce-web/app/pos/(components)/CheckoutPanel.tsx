import { Customer } from '@/lib/types';
import React from 'react'
import {
    User,
    Tag,
    ChevronRight,
} from 'lucide-react';
import { cn, currencyFormatter } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AppliedCoupon } from '@/lib/interfaces/appliedCoupon';
import { CartItem } from '@/lib/interfaces/cart-item';
import CartItemRow from './CartItemRow';


interface CheckoutPanelProps {
    totalItems: number;
    cart: CartItem[];
    updateQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    setCustomerModalOpen: (open: boolean) => void;
    setCouponModalOpen: (open: boolean) => void;
    setCheckoutModalOpen: (open: boolean) => void;
    selectedCustomer: Customer | null;
    appliedCoupons: AppliedCoupon[];
    discount: number;
    subtotal: number;
    total: number;
    canCheckout: boolean;
}

const CheckoutPanel = ({
    totalItems,
    cart,
    updateQuantity,
    removeFromCart,
    setCustomerModalOpen,
    setCouponModalOpen,
    setCheckoutModalOpen,
    selectedCustomer,
    appliedCoupons,
    discount,
    subtotal,
    total,
    canCheckout,
}: CheckoutPanelProps) => {
    return (
        <div className={cn(
            "w-full lg:w-[600px] xl:w-[600px] border-t lg:border-t-0 lg:border-l flex flex-col max-h-[50vh] lg:max-h-none",
            // "dark:bg-[linear-gradient(145deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.03)_100%)]",
            "bg-[linear-gradient(135deg,rgba(255,255,255,0.01)_0%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.07)_100%)]",
            "dark:bg-[#36393e\]",
            )}>
            {/* Cart Header */}
            <div className="border-b border-slate-100/80 px-4 md:px-5 py-3 shrink-0 dark:border-white/6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-wide dark:text-white/50">
                        Orden Actual
                    </h2>
                    <span className="text-xs md:text-sm font-mono font-bold text-slate-800 dark:text-white">
                        {totalItems} items
                    </span>
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 md:px-5 py-3 md:py-4 space-y-2">
                {cart.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[80px]">
                        <p className="text-sm text-slate-400 dark:text-white/30">Carrito vacío</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <CartItemRow
                            key={item.product.id}
                            item={item}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeFromCart}
                        />
                    ))
                )}
            </div>

            {/* Action Rows */}
            <div className="border-t border-slate-100/80 shrink-0 divide-y divide-slate-100/60 dark:border-white/6 dark:divide-white/6">
                {/* Customer Row */}
                <button
                    onClick={() => setCustomerModalOpen(true)}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 md:px-5 py-3.5 hover:bg-white/60 transition-colors text-left dark:hover:bg-white/4",
                    )}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedCustomer ? 'bg-slate-200/80 dark:bg-white/12' : 'bg-slate-100/80 dark:bg-white/6'
                        }`}>
                        <User className={`h-4 w-4 ${selectedCustomer ? 'text-slate-600 dark:text-white/70' : 'text-slate-400 dark:text-white/30'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        {selectedCustomer ? (
                            <>
                                <p className="text-sm font-medium text-slate-800 truncate dark:text-white">
                                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                                </p>
                                <p className="text-xs text-slate-400 truncate dark:text-white/40">{selectedCustomer.email}</p>
                            </>
                        ) : (
                            <p className="text-sm text-slate-400 dark:text-white/40">Seleccionar cliente <span className="text-slate-300 dark:text-white/20">*</span></p>
                        )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 dark:text-white/20 shrink-0" />
                </button>

                {/* Coupon Row */}
                <button
                    onClick={() => setCouponModalOpen(true)}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 md:px-5 py-3.5 hover:bg-white/60 transition-colors text-left dark:hover:bg-white/4",
                    )}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${appliedCoupons.length > 0 ? 'bg-slate-200/80 dark:bg-white/12' : 'bg-slate-100/80 dark:bg-white/6'
                        }`}>
                        <Tag className={`h-4 w-4 ${appliedCoupons.length > 0 ? 'text-slate-600 dark:text-white/70' : 'text-slate-400 dark:text-white/30'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        {appliedCoupons.length > 0 ? (
                            <>
                                <p className="text-sm font-medium text-slate-700 dark:text-white/80">
                                    {appliedCoupons.length === 1
                                        ? appliedCoupons[0].code
                                        : `${appliedCoupons.length} cupones aplicados`}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-emerald-400">
                                    −{currencyFormatter.format(discount)} de descuento
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-slate-400 dark:text-white/40">Agregar cupón</p>
                        )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 dark:text-white/20 shrink-0" />
                </button>
            </div>

            {/* Totals + Checkout */}
            <div className="border-t-2 border-slate-100/80 bg-slate-50/60 px-4 md:px-5 py-4 shrink-0 dark:bg-[#37393D] dark:border-white/6">
                <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-white/70">
                        <span>Subtotal</span>
                        <span className="font-mono">{currencyFormatter.format(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-xs text-slate-600 dark:text-emerald-400">
                            <span>Descuento</span>
                            <span className="font-mono">−{currencyFormatter.format(discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-800 pt-1 border-t border-slate-200/60 dark:text-white dark:border-white/8">
                        <span>Total</span>
                        <span className="font-mono text-lg">{currencyFormatter.format(total)}</span>
                    </div>
                </div>

                <Button
                    onClick={() => setCheckoutModalOpen(true)}
                    disabled={!canCheckout}
                    className="w-full h-11 md:h-12 text-sm md:text-base font-semibold bg-slate-800 hover:bg-slate-900 active:bg-slate-950 disabled:bg-slate-100 disabled:text-slate-400 touch-manipulation rounded-xl shadow-md shadow-slate-900/10 dark:bg-[#545559] dark:hover:bg-[#65666A] dark:disabled:bg-white/5 dark:disabled:text-white/25 cursor-pointer"
                >
                    Completar Venta
                </Button>
            </div>
        </div>
    )
}

export default CheckoutPanel
