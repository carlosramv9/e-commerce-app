'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Product, Customer, Category } from '@/lib/types';
import { CartItem } from '@/lib/interfaces/cart-item';
import { AppliedCoupon } from '@/lib/interfaces/appliedCoupon';
import ProductCard from './ProductCard';
import CheckoutPanel from './CheckoutPanel';
import { cn } from '@/lib/utils';

interface POSCobrarSectionProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categories: Category[];
  products: Product[];
  isProductsPending: boolean;
  onAddToCart: (product: Product) => void;
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
  totalItems: number;
  canCheckout: boolean;
}

function POSCobrarSectionInner({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  products,
  isProductsPending,
  onAddToCart,
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
  totalItems,
  canCheckout,
}: POSCobrarSectionProps) {
  return (
    <>
      {/* Grid de productos + panel de checkout */}
      <section
        className="flex-1 flex flex-col lg:flex-row overflow-hidden"
        aria-label="Productos y carrito"
      >
        {/* Barra de búsqueda y filtros */}
        <div
          className={cn(
            "backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 w-full",
          )}
          aria-label="Filtros de productos"
        >
          <div className="flex gap-2 md:gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/30"
                aria-hidden
              />
              <Input
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-10 md:h-11 bg-white/60 border-slate-200/80 dark:bg-white/5 dark:border-white/8 dark:text-white dark:placeholder:text-white/30"
                aria-label="Buscar producto"
              />
            </div>
            <Select
              value={categoryFilter || 'all'}
              onValueChange={(value) => onCategoryFilterChange(value === 'all' ? '' : value)}
            >
              <SelectTrigger
                className="w-32 md:w-48 h-10 md:h-11 bg-white/60 border-slate-200/80 dark:bg-white/5 dark:border-white/8 dark:text-white"
                aria-label="Filtrar por categoría"
              >
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 overflow-y-auto px-3 md:px-6 py-3 md:py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
            {products.length === 0 && !isProductsPending ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400 dark:text-white/30 text-sm">No se encontraron productos</p>
              </div>
            ) : null}
          </div>
        </div>


        <CheckoutPanel
          totalItems={totalItems}
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          setCustomerModalOpen={setCustomerModalOpen}
          setCouponModalOpen={setCouponModalOpen}
          setCheckoutModalOpen={setCheckoutModalOpen}
          selectedCustomer={selectedCustomer}
          appliedCoupons={appliedCoupons}
          discount={discount}
          subtotal={subtotal}
          total={total}
          canCheckout={canCheckout}
        />
      </section>
    </>
  );
}

// Memo para evitar re-renders cuando el padre actualiza otras secciones (rerender-memo)
export const POSCobrarSection = memo(POSCobrarSectionInner);
