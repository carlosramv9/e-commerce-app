import { CartItem } from '@/lib/interfaces/cart-item';
import { currencyFormatter } from '@/lib/utils';
import { Minus, Plus, X } from 'lucide-react';
import React, { useMemo } from 'react'

const CartItemRow = ({
    item,
    onUpdateQuantity,
    onRemove,
}: {
    item: CartItem;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemove: (productId: string) => void;
}) => {
    const itemTotal = useMemo(
        () => currencyFormatter.format(item.product.price * item.quantity),
        [item.product.price, item.quantity]
    );

    return (
        <div className="border border-neutral-200 rounded-lg p-2.5 md:p-3 bg-white">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                    <h4 className="text-xs md:text-sm font-medium text-neutral-900 leading-tight line-clamp-1">
                        {item.product.name}
                    </h4>
                    <p className="text-[10px] md:text-xs font-mono text-neutral-500 mt-0.5">{item.product.sku}</p>
                </div>
                <button
                    onClick={() => onRemove(item.product.id)}
                    className="text-neutral-400 hover:text-red-600 transition-colors p-1 touch-manipulation"
                >
                    <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </button>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 md:gap-2">
                    <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 active:bg-neutral-100 transition-colors touch-manipulation"
                    >
                        <Minus className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    </button>
                    <span className="w-8 md:w-10 text-center font-mono font-bold text-sm md:text-base text-neutral-900">
                        {item.quantity}
                    </span>
                    <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 active:bg-neutral-100 transition-colors touch-manipulation"
                    >
                        <Plus className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    </button>
                </div>
                <p className="font-mono font-bold text-sm md:text-base text-neutral-900">
                    {itemTotal}
                </p>
            </div>
        </div>
    );
}

export default CartItemRow