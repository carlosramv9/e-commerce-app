'use client';

import { useState, useCallback } from 'react';

export interface SaleSuccessState {
  orderId: string;
  orderNumber: string;
  total: number;
  paymentMethod: string;
}

/**
 * Estado de todos los modales del POS en un solo lugar.
 */
export function usePOSModals() {
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState<SaleSuccessState | null>(null);

  const openCustomerModal = useCallback(() => setCustomerModalOpen(true), []);
  const closeCustomerModal = useCallback(() => setCustomerModalOpen(false), []);

  const openCouponModal = useCallback(() => setCouponModalOpen(true), []);
  const closeCouponModal = useCallback(() => setCouponModalOpen(false), []);

  const openCheckoutModal = useCallback(() => setCheckoutModalOpen(true), []);
  const closeCheckoutModal = useCallback(() => setCheckoutModalOpen(false), []);

  const showSaleSuccess = useCallback((data: SaleSuccessState) => setSaleSuccess(data), []);
  const closeSaleSuccess = useCallback(() => setSaleSuccess(null), []);

  return {
    customerModalOpen,
    setCustomerModalOpen,
    openCustomerModal,
    closeCustomerModal,
    couponModalOpen,
    setCouponModalOpen,
    openCouponModal,
    closeCouponModal,
    checkoutModalOpen,
    setCheckoutModalOpen,
    openCheckoutModal,
    closeCheckoutModal,
    saleSuccess,
    setSaleSuccess,
    showSaleSuccess,
    closeSaleSuccess,
  };
}
