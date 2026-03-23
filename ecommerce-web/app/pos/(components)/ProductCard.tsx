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
        if (product.stock > 10) return 'text-slate-500 dark:text-white/40';
        if (product.stock > 0) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-500 dark:text-red-400';
    }, [product.stock]);

    return (
        <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className="group relative border border-slate-200/60 rounded-xl p-3 md:p-4 text-left transition-all hover:border-slate-400/60 hover:shadow-md hover:shadow-slate-900/5 hover:bg-white active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed bg-white/60 backdrop-blur-sm touch-manipulation dark:bg-[#37393D] dark:border-white/8 dark:hover:border-white/20 dark:hover:bg-[#2c2e33]"
        >
            <div className="absolute top-2 right-2">
                <span className="inline-block px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] font-mono bg-slate-100/80 text-slate-400 rounded-md dark:bg-white/6 dark:text-white/80">
                    {product.sku}
                </span>
            </div>
            <div className="pr-12 md:pr-16 mb-2">
                <h3 className="font-medium text-xs md:text-sm text-slate-800 line-clamp-2 leading-tight dark:text-white">
                    {product.name}
                </h3>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-[10px] md:text-xs text-slate-400 mb-0.5 dark:text-white/70">Precio</p>
                    <p className="font-bold text-base md:text-lg font-mono text-slate-800 dark:text-white">
                        {currencyFormatter.format(product.price)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] md:text-xs text-slate-400 mb-0.5 dark:text-white/80">Stock</p>
                    <p className={`text-xs md:text-sm font-bold font-mono ${stockColor}`}>
                        {product.stock}
                    </p>
                </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-slate-800 text-white rounded-full p-2 md:p-2.5 shadow-lg dark:bg-indigo-600">
                    <Plus className="h-4 w-4 md:h-5 md:w-5" />
                </div>
            </div>
        </button>
    );
}

export default ProductCard
