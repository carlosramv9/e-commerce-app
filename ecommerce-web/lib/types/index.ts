// Enums matching backend Prisma schema

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  CASHIER = 'CASHIER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum CustomerType {
  NEW = 'NEW',
  REGULAR = 'REGULAR',
  VIP = 'VIP',
  WHOLESALE = 'WHOLESALE',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum TaxCode {
  IVA_16 = 'IVA_16',
  IVA_11 = 'IVA_11',
  IVA_8 = 'IVA_8',
  EXCENTO = 'EXCENTO',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
}

export enum CouponScope {
  GLOBAL = 'GLOBAL',
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
}

// Model Interfaces

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  type: CustomerType;
  status: CustomerStatus;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  status: CategoryStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  price: number;
  taxRate: number | null;
  taxCode: TaxCode | null;
  comparePrice: number | null;
  costPrice: number | null;
  trackInventory: boolean;
  stock: number;
  lowStockAlert: number | null;
  status: ProductStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  images?: ProductImage[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  transactionId: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerType: CustomerType;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  couponCode: string | null;
  couponId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items?: OrderItem[];
  payments?: Payment[];
  shippingAddress?: CustomerAddress | null;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  scope: CouponScope;
  productId: string | null;
  categoryId: string | null;
  minPurchase: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageLimitPerCustomer: number | null;
  usageCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  autoApply: boolean;
  customerTypes: CustomerType[];
  isFirstPurchaseOnly: boolean;
  minOrders: number | null;
  createdAt: string;
  updatedAt: string;
}

// API Response Types

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  recentOrders: Order[];
}

// DTOs

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  price: number;
  taxRate?: number;
  taxCode?: TaxCode;
  comparePrice?: number;
  costPrice?: number;
  trackInventory: boolean;
  stock: number;
  lowStockAlert?: number;
  status: ProductStatus;
  metaTitle?: string;
  metaDescription?: string;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status: CategoryStatus;
  sortOrder: number;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export interface CreateOrderDto {
  customerId?: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  couponCode?: string;
  paymentMethod: string;
  payments?: Array<{ method: string; amount: number }>;
  shippingCost?: number;
  notes?: string;
  paymentStatus?: PaymentStatus;
  status?: OrderStatus;
}

export interface CreateCouponDto {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  scope: CouponScope;
  productId?: string;
  categoryId?: string;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  autoApply: boolean;
  customerTypes: CustomerType[];
  isFirstPurchaseOnly: boolean;
  minOrders?: number;
}

export type UpdateCouponDto = Partial<CreateCouponDto>;

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  password?: string;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  type?: CustomerType;
  status?: CustomerStatus;
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>;
