import { Customer } from '@/lib/types';
import React from 'react'
import {
    User,
    Tag,
    ChevronRight,
} from 'lucide-react';
import { currencyFormatter } from '@/lib/utils';
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
        <div className="w-full lg:w-[600px] xl:w-[640px] border-t lg:border-t-0 lg:border-l border-neutral-200 bg-white flex flex-col max-h-[50vh] lg:max-h-none">
            {/* Cart Header */}
            <div className="border-b border-neutral-200 px-4 md:px-5 py-3 bg-neutral-50 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs md:text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                        Orden Actual
                    </h2>
                    <span className="text-xs md:text-sm font-mono font-bold text-neutral-900">
                        {totalItems} items
                    </span>
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 md:px-5 py-3 md:py-4 space-y-2">
                {cart.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[80px]">
                        <p className="text-sm text-neutral-400">Carrito vacío</p>
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
            <div className="border-t border-neutral-200 shrink-0 divide-y divide-neutral-100">
                {/* Customer Row */}
                <button
                    onClick={() => setCustomerModalOpen(true)}
                    className="w-full flex items-center gap-3 px-4 md:px-5 py-3.5 hover:bg-neutral-50 transition-colors text-left"
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedCustomer ? 'bg-blue-100' : 'bg-neutral-100'
                        }`}>
                        <User className={`h-4 w-4 ${selectedCustomer ? 'text-blue-600' : 'text-neutral-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        {selectedCustomer ? (
                            <>
                                <p className="text-sm font-medium text-neutral-900 truncate">
                                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                                </p>
                                <p className="text-xs text-neutral-500 truncate">{selectedCustomer.email}</p>
                            </>
                        ) : (
                            <p className="text-sm text-neutral-500">Seleccionar cliente <span className="text-red-500">*</span></p>
                        )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />
                </button>

                {/* Coupon Row */}
                <button
                    onClick={() => setCouponModalOpen(true)}
                    className="w-full flex items-center gap-3 px-4 md:px-5 py-3.5 hover:bg-neutral-50 transition-colors text-left"
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${appliedCoupons.length > 0 ? 'bg-emerald-100' : 'bg-neutral-100'
                        }`}>
                        <Tag className={`h-4 w-4 ${appliedCoupons.length > 0 ? 'text-emerald-600' : 'text-neutral-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        {appliedCoupons.length > 0 ? (
                            <>
                                <p className="text-sm font-medium text-emerald-700">
                                    {appliedCoupons.length === 1
                                        ? appliedCoupons[0].code
                                        : `${appliedCoupons.length} cupones aplicados`}
                                </p>
                                <p className="text-xs text-emerald-600">
                                    −{currencyFormatter.format(discount)} de descuento
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-neutral-500">Agregar cupón</p>
                        )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />
                </button>
            </div>

            {/* Totals + Checkout */}
            <div className="border-t-2 border-neutral-200 bg-neutral-50 px-4 md:px-5 py-4 shrink-0">
                <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs text-neutral-600">
                        <span>Subtotal</span>
                        <span className="font-mono">{currencyFormatter.format(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600">
                            <span>Descuento</span>
                            <span className="font-mono">−{currencyFormatter.format(discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-neutral-900 pt-1 border-t border-neutral-200">
                        <span>Total</span>
                        <span className="font-mono text-lg">{currencyFormatter.format(total)}</span>
                    </div>
                </div>

                <Button
                    onClick={() => setCheckoutModalOpen(true)}
                    disabled={!canCheckout}
                    className="w-full h-11 md:h-12 text-sm md:text-base font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-neutral-200 disabled:text-neutral-400 touch-manipulation"
                >
                    Completar Venta
                </Button>
            </div>
        </div>
    )
}

export default CheckoutPanel