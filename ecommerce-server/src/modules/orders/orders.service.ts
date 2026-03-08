import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { Order, OrderStatus, Coupon, PaymentStatus } from '@prisma/client';
import { CouponsService } from '../coupons/coupons.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
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

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
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

      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          paymentMethod: dto.paymentMethod,
          amount: total,
          status: (dto.paymentStatus ?? 'PENDING') as any,
        },
      });

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
          payment: true,
        },
      });
    });

    return order!;
  }

  async findAll(query: QueryOrdersDto): Promise<PaginatedResponse<Order>> {
    const { skip, limit, page, customerId, status } = query;
    const where = {
      ...(customerId != null && { customerId }),
      ...(status != null && { status }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
          payment: true,
        },
      }),
      this.prisma.order.count({ where: Object.keys(where).length > 0 ? where : undefined }),
    ]);

    return {
      data: orders,
      meta: {
        page: page,
        limit: limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        shippingAddress: true,
        items: {
          include: { product: true },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async getStats() {
    const [totalOrders, totalRevenue, pendingOrders, recentOrders] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          _sum: { total: true },
          where: { paymentStatus: 'PAID' },
        }),
        this.prisma.order.count({
          where: { status: 'PENDING' },
        }),
        this.prisma.order.findMany({
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
