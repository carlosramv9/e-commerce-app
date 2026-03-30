'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import CheckoutModal from './(components)/CheckoutModal';
import CouponModal from './(components)/CouponModal';
import CustomerModal from './(components)/CustomerModal';
import POSSidebar, { POSSection } from './(components)/POSSidebar';
import { POSCobrarSection } from './(components)/POSCobrarSection';
import SaleSuccessModal from './(components)/SaleSuccessModal';
import VentasSection from './(components)/VentasSection';
import ClientesSection from './(components)/ClientesSection';
import InventarioSection from './(components)/InventarioSection';
import PromocionesSection from './(components)/PromocionesSection';
import {
  usePOSClock,
  usePOSData,
  usePOSCart,
  usePOSModals,
  usePOSOrder,
  usePOSAutoApplyCoupons,
} from './hooks';
import { useAuthStore } from '@/lib/store/auth-store';

export default function POSPage() {
  const router = useRouter();
  const { posOnly, logout } = useAuthStore();
  const currentTime = usePOSClock();
  const [activeSection, setActiveSection] = useState<POSSection>('cobrar');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const {
    products,
    customers,
    categories,
    loading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    isPending,
    refreshProducts,
  } = usePOSData();

  const {
    cart,
    appliedCoupons,
    setAppliedCoupons,
    addToCart,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    total,
    totalItems,
    canCheckout: cartCanCheckout,
    clearCartAndCoupons,
  } = usePOSCart();

  const {
    customerModalOpen,
    setCustomerModalOpen,
    couponModalOpen,
    setCouponModalOpen,
    checkoutModalOpen,
    setCheckoutModalOpen,
    saleSuccess,
    showSaleSuccess,
    closeSaleSuccess,
  } = usePOSModals();

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

  const { creatingOrder, handleCreateOrder } = usePOSOrder({
    cart,
    appliedCoupons,
    selectedCustomerId,
    onSuccess: showSaleSuccess,
    clearCartAndCoupons,
    closeCheckoutModal: () => setCheckoutModalOpen(false),
    refreshProducts,
  });

  usePOSAutoApplyCoupons({
    selectedCustomerId,
    cart,
    subtotal,
    setAppliedCoupons,
  });

  const canCheckout = cartCanCheckout && !creatingOrder;

  const handleNewCustomer = useCallback(() => {
    router.push('/customers/new');
  }, [router]);

  const handleNewSale = useCallback(() => {
    closeSaleSuccess();
    setSelectedCustomerId('');
  }, [closeSaleSuccess]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FAFBFD] dark:bg-[#373A49]">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400 dark:text-white/30" aria-hidden />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden relative bg-[#FAFBFD] dark:bg-[#2c2e33]">
      {/* Mesh gradient orbs — dark only */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="hidden dark:block absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full blur-[120px]" />
        <div className="hidden dark:block absolute top-[35%] -right-32 w-[600px] h-[600px] rounded-full blur-[140px]" />
        <div className="hidden dark:block absolute -bottom-24 left-[15%] w-[500px] h-[500px] rounded-full blur-[110px]" />
      </div>
      <POSSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        cartCount={totalItems}
        onExit={() => {
          if (posOnly) {
            logout();
            router.push('/login');
          } else {
            router.push('/dashboard');
          }
        }}
        currentTime={currentTime}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeSection === 'cobrar' ? (
          <POSCobrarSection
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categories={categories}
            products={products}
            isProductsPending={isPending}
            onAddToCart={addToCart}
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
            totalItems={totalItems}
            canCheckout={canCheckout}
          />
        ) : null}

        {activeSection === 'ventas' ? <VentasSection /> : null}

        {activeSection === 'clientes' ? (
          <ClientesSection
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
            onNewCustomer={handleNewCustomer}
            onSelectionDone={() => setActiveSection('cobrar')}
          />
        ) : null}

        {activeSection === 'inventario' ? (
          <InventarioSection products={products} />
        ) : null}

        {activeSection === 'promociones' ? (
          <PromocionesSection
            onApply={() => {
              setActiveSection('cobrar');
              setCouponModalOpen(true);
            }}
          />
        ) : null}
      </div>

      <CustomerModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        customers={customers}
        selectedCustomer={selectedCustomerId}
        onSelectCustomer={setSelectedCustomerId}
        onNewCustomer={handleNewCustomer}
      />

      <CouponModal
        open={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        appliedCoupons={appliedCoupons}
        onApplyCoupon={applyCoupon}
        onRemoveCoupon={removeCoupon}
        subtotal={subtotal}
        selectedCustomer={selectedCustomerId}
      />

      <CheckoutModal
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cart={cart}
        customer={selectedCustomer ?? undefined}
        appliedCoupons={appliedCoupons}
        subtotal={subtotal}
        discount={discount}
        total={total}
        onConfirm={handleCreateOrder}
        confirming={creatingOrder}
      />

      <SaleSuccessModal
        open={saleSuccess !== null}
        orderNumber={saleSuccess?.orderNumber ?? ''}
        total={saleSuccess?.total ?? 0}
        paymentMethod={saleSuccess?.paymentMethod ?? 'CASH'}
        customer={selectedCustomer ?? undefined}
        autoCloseSecs={4}
        onClose={handleNewSale}
      />
    </div>
  );
}
