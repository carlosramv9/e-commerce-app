'use client';

import { useState, useCallback, useMemo } from 'react';
import { Product } from '@/lib/types';
import { CartItem } from '@/lib/interfaces/cart-item';
import { AppliedCoupon } from '@/lib/interfaces/appliedCoupon';
import { toast } from 'sonner';

/**
 * Estado del carrito, cupones aplicados y totales derivados.
 * Usa setState funcional para callbacks estables (rerender-functional-setstate).
 */
export function usePOSCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);

  const addToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          toast.error('Stock insuficiente');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.product.id === productId);
      if (item && newQuantity > item.product.stock) {
        toast.error('Stock insuficiente');
        return prevCart;
      }
      return prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const applyCoupon = useCallback((coupon: AppliedCoupon) => {
    setAppliedCoupons((prev) => [...prev, coupon]);
  }, []);

  const removeCoupon = useCallback((code: string) => {
    setAppliedCoupons((prev) => prev.filter((c) => c.code !== code));
  }, []);

  // Totales derivados en render (rerender-derived-state)
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const discount = useMemo(() => {
    let total = 0;
    for (const coupon of appliedCoupons) {
      let d = 0;
      if (coupon.type === 'PERCENTAGE') {
        d = (subtotal * coupon.value) / 100;
      } else if (coupon.type === 'FIXED_AMOUNT') {
        d = coupon.value;
      }
      if (coupon.maxDiscount != null && d > coupon.maxDiscount) d = coupon.maxDiscount;
      total += d;
    }
    return total;
  }, [appliedCoupons, subtotal]);

  const total = subtotal - discount;
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const canCheckout = cart.length > 0;

  const clearCartAndCoupons = useCallback(() => {
    setCart([]);
    setAppliedCoupons([]);
  }, []);

  return {
    cart,
    appliedCoupons,
    addToCart,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    total,
    totalItems,
    canCheckout,
    clearCartAndCoupons,
  };
}
