'use client';

import { useEffect, useState, useMemo, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  LogOut,
  Clock,
  Loader2,
} from 'lucide-react';
import { productsApi } from '@/lib/api/products';
import { customersApi } from '@/lib/api/customers';
import { ordersApi } from '@/lib/api/orders';
import { categoriesApi } from '@/lib/api/categories';
import { Product, Customer, Category, PaymentStatus, OrderStatus } from '@/lib/types';
import { toast } from 'sonner';
import { CartItem } from '@/lib/interfaces/cart-item';
import { AppliedCoupon } from '@/lib/interfaces/appliedCoupon';
import CheckoutPanel from './(components)/CheckoutPanel';
import CheckoutModal from './(components)/CheckoutModal';
import CouponModal from './(components)/CouponModal';
import ProductCard from './(components)/ProductCard';
import CustomerModal from './(components)/CustomerModal';
import SaleSuccessModal from './(components)/SaleSuccessModal';

// ─── Main POS Page ────────────────────────────────────────────────────────────
export default function POSPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal states
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState<{
    orderId: string;
    orderNumber: string;
    total: number;
    paymentMethod: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [customersRes, categoriesRes] = await Promise.all([
          customersApi.getAll(),
          categoriesApi.getAll(),
        ]);
        setCustomers(customersRes.data.data || customersRes.data);
        setCategories(categoriesRes.data);
      } catch {
        toast.error('Error al cargar datos iniciales');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const params: any = { status: 'ACTIVE', limit: 100 };
        if (search) params.search = search;
        if (categoryFilter) params.categoryId = categoryFilter;

        const response = await productsApi.getAll(params);
        startTransition(() => {
          setProducts(response.data.data);
        });
      } catch {
        toast.error('Error al cargar productos');
      }
    };
    loadProducts();
  }, [search, categoryFilter]);

  // Derived customer
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  // Cart operations
  const addToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          toast.error('Stock insuficiente');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prevCart) => {
      const item = prevCart.find((item) => item.product.id === productId);
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
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  }, []);

  // Calculations
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
      if (coupon.maxDiscount && d > coupon.maxDiscount) d = coupon.maxDiscount;
      total += d;
    }
    return total;
  }, [appliedCoupons, subtotal]);

  const total = useMemo(() => subtotal - discount, [subtotal, discount]);
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const canCheckout = useMemo(
    () => cart.length > 0 && !creatingOrder,
    [cart.length, creatingOrder]
  );

  // Coupon handlers
  const handleApplyCoupon = useCallback((coupon: AppliedCoupon) => {
    setAppliedCoupons((prev) => [...prev, coupon]);
  }, []);

  const handleRemoveCoupon = useCallback((code: string) => {
    setAppliedCoupons((prev) => prev.filter((c) => c.code !== code));
  }, []);

  // Order creation (cliente y cupones opcionales — venta rápida al público general)
  const handleCreateOrder = useCallback(async (paymentMethod: string) => {
    if (cart.length === 0) return;

    try {
      setCreatingOrder(true);
      const orderData: Parameters<typeof ordersApi.create>[0] = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        paymentMethod,
        paymentStatus: PaymentStatus.PAID,
        shippingCost: 0,
        notes: '',
        status: OrderStatus.CONFIRMED,
      };
      if (selectedCustomerId) orderData.customerId = selectedCustomerId;
      if (appliedCoupons[0]?.code) orderData.couponCode = appliedCoupons[0].code;

      const response = await ordersApi.create(orderData);

      // Close checkout modal and reset cart before showing success
      setCheckoutModalOpen(false);
      setCart([]);
      setAppliedCoupons([]);

      setSaleSuccess({
        orderId: response.data.id,
        orderNumber: response.data.orderNumber,
        total: response.data.total,
        paymentMethod,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al registrar venta';
      toast.error(message);
    } finally {
      setCreatingOrder(false);
    }
  }, [cart, selectedCustomerId, appliedCoupons]);

  const handleNewCustomer = useCallback(() => {
    router.push('/customers/new');
  }, [router]);

  const handleNewSale = useCallback(() => {
    setSaleSuccess(null);
    setSelectedCustomerId('');
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#fdfcfb] overflow-hidden">
      {/* Top Bar */}
      <div className="border-b border-neutral-200 bg-white px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-base md:text-lg font-semibold text-neutral-900">Terminal POS</h1>
            <p className="hidden md:block text-xs text-neutral-500 font-mono mt-0.5">
              {currentTime.toLocaleString('es-MX', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="md:hidden flex items-center gap-1.5 text-neutral-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-mono">
              {currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs text-neutral-500">Items</p>
            <p className="text-lg font-bold font-mono text-neutral-900">{totalItems}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="border-neutral-300 hover:bg-neutral-100"
          >
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Salir</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Products Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Filters */}
          <div className="border-b border-neutral-200 bg-white px-4 md:px-6 py-3 md:py-4 shrink-0">
            <div className="flex gap-2 md:gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Buscar producto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 md:h-11 border-neutral-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Select
                value={categoryFilter || 'all'}
                onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-32 md:w-48 h-10 md:h-11 border-neutral-300">
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
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto px-3 md:px-6 py-3 md:py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
            {products.length === 0 && !isPending && (
              <div className="flex items-center justify-center h-full">
                <p className="text-neutral-400 text-sm">No se encontraron productos</p>
              </div>
            )}
          </div>
        </div>

        {/* Checkout Panel */}
        <CheckoutPanel
          totalItems={totalItems}
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          setCustomerModalOpen={setCustomerModalOpen}
          setCouponModalOpen={setCouponModalOpen}
          setCheckoutModalOpen={setCheckoutModalOpen}
          selectedCustomer={selectedCustomer as Customer | null}
          appliedCoupons={appliedCoupons}
          discount={discount}
          subtotal={subtotal}
          total={total}
          canCheckout={canCheckout}
        />
      </div>

      {/* Modals */}
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
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        subtotal={subtotal}
        selectedCustomer={selectedCustomerId}
      />

      <CheckoutModal
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cart={cart}
        customer={selectedCustomer}
        appliedCoupons={appliedCoupons}
        subtotal={subtotal}
        discount={discount}
        total={total}
        onConfirm={handleCreateOrder}
        confirming={creatingOrder}
      />

      <SaleSuccessModal
        open={!!saleSuccess}
        orderNumber={saleSuccess?.orderNumber ?? ''}
        total={saleSuccess?.total ?? 0}
        paymentMethod={saleSuccess?.paymentMethod ?? 'CASH'}
        customer={selectedCustomer}
        autoCloseSecs={4}
        onClose={handleNewSale}
      />
    </div>
  );
}
