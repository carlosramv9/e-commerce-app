import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditContextService } from '../../common/context/audit-context.service';
import { TenantContextService } from '../../common/context/tenant-context.service';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { Order, OrderStatus, Coupon, PaymentStatus } from '@prisma/client';
import { CouponsService } from '../coupons/coupons.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private auditContext: AuditContextService,
    private tenantContext: TenantContextService,
    private couponsService: CouponsService,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    if (!dto.items?.length) {
      throw new BadRequestException('La venta debe tener al menos un item');
    }

    const customerId: string | null = dto.customerId ?? null;
    let addressId: string | null = null;

    if (customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        include: { addresses: true },
      });
      if (!customer) {
        throw new NotFoundException('Cliente no encontrado');
      }
      const address = customer.addresses.find((a) => a.isDefault) ?? customer.addresses[0];
      if (address) addressId = address.id;
    }

    const productIds = [...new Set(dto.items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });
    if (products.length !== productIds.length) {
      const found = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !found.has(id));
      throw new NotFoundException(`Productos no encontrados: ${missing.join(', ')}`);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    let discountAmount = 0;
    let couponId: string | null = null;
    let couponCode: string | null = null;

    if (dto.couponCode?.trim()) {
      const categoryIds = [
        ...new Set(
          products
            .map((p) => p.categoryId)
            .filter((id): id is string => id !== null),
        ),
      ];
      const validation = await this.couponsService.validateCoupon({
        code: dto.couponCode.trim(),
        customerId: customerId ?? undefined,
        productIds,
        categoryIds,
        totalAmount: subtotal,
      });
      if (!validation.valid) {
        throw new BadRequestException(validation.message ?? 'Cupón no válido');
      }
      discountAmount = validation.discountAmount ?? 0;
      if (validation.coupon) {
        couponId = validation.coupon.id;
        couponCode = validation.coupon.code;
      }
    }

    const shippingCost = dto.shippingCost ?? 0;
    const tax = 0;
    const total = Math.max(0, subtotal - discountAmount + shippingCost + tax);
    const orderNumber = `V-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const createdById = this.auditContext.getUserId() ?? null;
    const tenantId = this.tenantContext.requireTenantId();
    const branchId = this.tenantContext.getBranchId() ?? null;

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          tenantId,
          ...(customerId != null && { customerId }),
          ...(addressId != null && { addressId }),
          subtotal,
          tax,
          shippingCost,
          discount: discountAmount,
          total,
          ...(dto.notes != null && dto.notes !== '' && { notes: dto.notes }),
          ...(couponId != null && { couponId }),
          ...(couponCode != null && { couponCode }),
          status: (dto.status ?? 'PENDING') as any,
          paymentStatus: (dto.paymentStatus ?? PaymentStatus.PENDING) as any,
          ...(createdById != null && { createdById }),
          ...(branchId != null && { branchId }),
        },
      });

      for (const item of dto.items) {
        const product = productMap.get(item.productId)!;
        const itemTotal = item.price * item.quantity;
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            quantity: item.quantity,
            price: item.price,
            discount: 0,
            total: itemTotal,
          },
        });
      }

      // Decrement product stock
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      console.log('===================================> decrement product stock');

      // Decrement branch inventory (upsert: create with remaining product stock if missing)
      if (branchId) {
        for (const item of dto.items) {
          const updatedProduct = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true },
          });
          await tx.branchInventory.upsert({
            where: { branchId_productId: { branchId, productId: item.productId } },
            update: { stock: { decrement: item.quantity } },
            create: {
              branchId,
              productId: item.productId,
              stock: updatedProduct?.stock ?? 0,
            },
          });
        }
      }

      const paymentStatus = (dto.paymentStatus ?? 'PENDING') as any;
      if (dto.payments && dto.payments.length > 0) {
        // Split payment: one Payment row per method
        for (const split of dto.payments) {
          await tx.payment.create({
            data: {
              orderId: newOrder.id,
              paymentMethod: split.method,
              amount: split.amount,
              status: paymentStatus,
            },
          });
        }
      } else {
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            paymentMethod: dto.paymentMethod,
            amount: total,
            status: paymentStatus,
          },
        });
      }

      if (couponId) {
        await this.couponsService.incrementUsage(couponId);
      }

      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalOrders: { increment: 1 },
            totalSpent: { increment: total },
          },
        });
      }

      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          customer: true,
          shippingAddress: true,
          items: { include: { product: true } },
          payments: true,
        },
      });
    });

    return order!;
  }

  async findAll(query: QueryOrdersDto): Promise<PaginatedResponse<Order>> {
    const tenantId = this.tenantContext.requireTenantId();
    const { skip, limit, page, customerId, status } = query;

    const where: any = {
      tenantId,
      ...(customerId != null && { customerId }),
      ...(status != null && { status }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: { include: { product: true } },
          payments: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Order> {
    const tenantId = this.tenantContext.requireTenantId();
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        shippingAddress: true,
        items: { include: { product: true } },
        payments: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const tenantId = this.tenantContext.requireTenantId();
    const order = await this.prisma.order.findFirst({ where: { id, tenantId } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { customer: true, items: true },
    });
  }

  async getStats() {
    const tenantId = this.tenantContext.requireTenantId();

    const [totalOrders, totalRevenue, pendingOrders, recentOrders] =
      await Promise.all([
        this.prisma.order.count({ where: { tenantId } }),
        this.prisma.order.aggregate({
          _sum: { total: true },
          where: { tenantId, paymentStatus: 'PAID' },
        }),
        this.prisma.order.count({ where: { tenantId, status: 'PENDING' } }),
        this.prisma.order.findMany({
          where: { tenantId },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: true,
            _count: { select: { items: true } },
          },
        }),
      ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      recentOrders,
    };
  }

  /**
   * Obtiene cupones auto-aplicables para una orden en proceso
   */
  async getApplicableCoupons(params: {
    customerId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }): Promise<Coupon[]> {
    // Obtener IDs de productos y sus categorías
    const productIds = params.items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    const categoryIds = [
      ...new Set(
        products
          .map((p) => p.categoryId)
          .filter((id): id is string => id !== null),
      ),
    ];

    // Calcular total de la orden
    const totalAmount = params.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Obtener cupones auto-aplicables
    return this.couponsService.getAutoApplicableCoupons({
      customerId: params.customerId,
      productIds,
      categoryIds,
      totalAmount,
    });
  }

  /**
   * Calcula el mejor descuento de múltiples cupones auto-aplicables
   */
  async calculateBestDiscount(params: {
    customerId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }): Promise<{
    bestCoupon: Coupon | null;
    discountAmount: number;
  }> {
    const applicableCoupons = await this.getApplicableCoupons(params);

    if (applicableCoupons.length === 0) {
      return { bestCoupon: null, discountAmount: 0 };
    }

    const totalAmount = params.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    let bestCoupon: Coupon | null = null;
    let maxDiscount = 0;

    for (const coupon of applicableCoupons) {
      let discount = 0;

      if (coupon.type === 'PERCENTAGE') {
        discount = (totalAmount * Number(coupon.value)) / 100;

        // Aplicar descuento máximo si existe
        if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
          discount = Number(coupon.maxDiscount);
        }
      } else {
        // FIXED
        discount = Math.min(Number(coupon.value), totalAmount);
      }

      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestCoupon = coupon;
      }
    }

    return {
      bestCoupon,
      discountAmount: maxDiscount,
    };
  }
}
