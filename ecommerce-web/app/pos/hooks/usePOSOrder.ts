'use client';

import { useState, useCallback } from 'react';
import { ordersApi } from '@/lib/api/orders';
import { PaymentStatus, OrderStatus } from '@/lib/types';
import { CartItem } from '@/lib/interfaces/cart-item';
import { AppliedCoupon } from '@/lib/interfaces/appliedCoupon';
import { toast } from 'sonner';
import type { PaymentSplit } from '../(components)/CheckoutModal';
import type { SaleSuccessState } from './usePOSModals';

interface UsePOSOrderArgs {
  cart: CartItem[];
  appliedCoupons: AppliedCoupon[];
  selectedCustomerId: string;
  onSuccess: (data: SaleSuccessState) => void;
  clearCartAndCoupons: () => void;
  closeCheckoutModal: () => void;
  refreshProducts: () => Promise<void>;
}

/**
 * Creación de orden y estado de carga.
 * Lógica en el handler, no en efecto (rerender-move-effect-to-event).
 */
export function usePOSOrder({
  cart,
  appliedCoupons,
  selectedCustomerId,
  onSuccess,
  clearCartAndCoupons,
  closeCheckoutModal,
  refreshProducts,
}: UsePOSOrderArgs) {
  const [creatingOrder, setCreatingOrder] = useState(false);

  const handleCreateOrder = useCallback(
    async (payments: PaymentSplit[]) => {
      if (cart.length === 0) return;

      const primaryMethod = payments.reduce((a, b) => (b.amount > a.amount ? b : a)).method;
      const methodLabel =
        payments.length > 1 ? payments.map((p) => p.method).join(' + ') : primaryMethod;

      try {
        setCreatingOrder(true);
        const orderData: Parameters<typeof ordersApi.create>[0] = {
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          paymentMethod: primaryMethod,
          ...(payments.length > 1 && {
            payments: payments.map((p) => ({ method: p.method, amount: p.amount })),
          }),
          paymentStatus: PaymentStatus.PAID,
          shippingCost: 0,
          notes: '',
          status: OrderStatus.CONFIRMED,
        };
        if (selectedCustomerId) orderData.customerId = selectedCustomerId;
        if (appliedCoupons[0]?.code) orderData.couponCode = appliedCoupons[0].code;

        const response = await ordersApi.create(orderData);

        closeCheckoutModal();
        clearCartAndCoupons();
        refreshProducts();
        onSuccess({
          orderId: response.data.id,
          orderNumber: response.data.orderNumber,
          total: response.data.total,
          paymentMethod: methodLabel,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Error al registrar venta';
        toast.error(message);
      } finally {
        setCreatingOrder(false);
      }
    },
    [
      cart,
      appliedCoupons,
      selectedCustomerId,
      onSuccess,
      clearCartAndCoupons,
      closeCheckoutModal,
      refreshProducts,
    ]
  );

  return { creatingOrder, handleCreateOrder };
}
