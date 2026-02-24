import { Product } from '@/lib/types';
import { currencyFormatter } from '@/lib/utils';
import { Plus } from 'lucide-react';
import React, { useMemo } from 'react'

const ProductCard = ({
    product,
    onAddToCart,
}: {
    product: Product;
    onAddToCart: (product: Product) => void;
}) => {
    const isOutOfStock = product.stock === 0;

    const stockColor = useMemo(() => {
        if (product.stock > 10) return 'text-emerald-600';
        if (product.stock > 0) return 'text-amber-600';
        return 'text-red-600';
    }, [product.stock]);

    return (
        <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className="group relative border border-neutral-200 rounded-lg p-3 md:p-4 text-left transition-all hover:border-blue-400 hover:shadow-sm active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed bg-white touch-manipulation"
        >
            <div className="absolute top-2 right-2">
                <span className="inline-block px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] font-mono bg-neutral-100 text-neutral-600 rounded">
                    {product.sku}
                </span>
            </div>
            <div className="pr-12 md:pr-16 mb-2">
                <h3 className="font-medium text-xs md:text-sm text-neutral-900 line-clamp-2 leading-tight">
                    {product.name}
                </h3>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-[10px] md:text-xs text-neutral-500 mb-0.5">Precio</p>
                    <p className="font-bold text-base md:text-lg font-mono text-neutral-900">
                        {currencyFormatter.format(product.price)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] md:text-xs text-neutral-500 mb-0.5">Stock</p>
                    <p className={`text-xs md:text-sm font-bold font-mono ${stockColor}`}>
                        {product.stock}
                    </p>
                </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-blue-500 text-white rounded-full p-2 md:p-2.5">
                    <Plus className="h-4 w-4 md:h-5 md:w-5" />
                </div>
            </div>
        </button>
    );
}

export default ProductCard