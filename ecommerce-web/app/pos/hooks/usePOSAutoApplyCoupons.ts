'use client';

import { useEffect, useRef } from 'react';
import { couponsApi } from '@/lib/api/coupons';
import { Coupon } from '@/lib/types';
import { CartItem } from '@/lib/interfaces/cart-item';
import { AppliedCoupon } from '@/lib/interfaces/appliedCoupon';

interface UsePOSAutoApplyCouponsArgs {
  selectedCustomerId: string;
  cart: CartItem[];
  subtotal: number;
  setAppliedCoupons: (coupons: AppliedCoupon[]) => void;
}

/**
 * Evalúa cupones autoaplicables cuando hay un cliente seleccionado y carrito con items.
 * Se re-evalúa al cambiar el cliente, agregar/quitar items, o cambiar el subtotal.
 * Usa debounce de 500ms para evitar llamadas excesivas.
 */
export function usePOSAutoApplyCoupons({
  selectedCustomerId,
  cart,
  subtotal,
  setAppliedCoupons,
}: UsePOSAutoApplyCouponsArgs) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timerRef.current);

    if (!selectedCustomerId || cart.length === 0) return;

    timerRef.current = setTimeout(async () => {
      try {
        const res = await couponsApi.getAll({ isActive: true, autoApply: true, limit: 50 });
        const coupons: Coupon[] = res.data;

        if (!coupons.length) {
          setAppliedCoupons([]);
          return;
        }

        const validCoupons: AppliedCoupon[] = [];

        for (const coupon of coupons) {
          try {
            const validation = await couponsApi.validate(
              coupon.code,
              selectedCustomerId,
              subtotal,
            );
            if (validation.data.valid) {
              validCoupons.push({
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                maxDiscount: coupon.maxDiscount ?? undefined,
              });
            }
          } catch {
            // Skip invalid coupons silently
          }
        }

        setAppliedCoupons(validCoupons);
      } catch {
        // Silently fail — auto-apply is best-effort
      }
    }, 500);

    return () => clearTimeout(timerRef.current);
  }, [selectedCustomerId, cart, subtotal, setAppliedCoupons]);
}
