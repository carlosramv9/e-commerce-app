import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponDto } from './dto/query-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { Coupon } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    // Validar que el código del cupón no exista
    const existing = await this.prisma.coupon.findUnique({
      where: { code: createCouponDto.code },
    });

    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }

    // Validar scope
    if (createCouponDto.scope === 'PRODUCT' && !createCouponDto.productId) {
      throw new BadRequestException('Product ID is required for PRODUCT scope');
    }

    if (createCouponDto.scope === 'CATEGORY' && !createCouponDto.categoryId) {
      throw new BadRequestException('Category ID is required for CATEGORY scope');
    }

    // Convertir fechas a Date objects
    const data: any = {
      ...createCouponDto,
      startDate: new Date(createCouponDto.startDate),
      endDate: createCouponDto.endDate ? new Date(createCouponDto.endDate) : null,
    };

    return this.prisma.coupon.create({ data });
  }

  async findAll(query?: QueryCouponDto): Promise<Coupon[]> {
    const where: any = {};

    if (query?.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.type) {
      where.type = query.type;
    }

    if (query?.scope) {
      where.scope = query.scope;
    }

    if (query?.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query?.autoApply !== undefined) {
      where.autoApply = query.autoApply;
    }

    return this.prisma.coupon.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: {
        product: true,
        category: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({
      where: { code },
      include: {
        product: true,
        category: true,
      },
    });
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    await this.findOne(id); // Verificar que existe

    const data: any = { ...updateCouponDto };

    // Convertir fechas si están presentes
    if (updateCouponDto.startDate) {
      data.startDate = new Date(updateCouponDto.startDate);
    }

    if (updateCouponDto.endDate) {
      data.endDate = new Date(updateCouponDto.endDate);
    }

    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Verificar que existe

    await this.prisma.coupon.delete({
      where: { id },
    });
  }

  async validateCoupon(validateDto: ValidateCouponDto): Promise<{
    valid: boolean;
    message?: string;
    coupon?: Coupon;
    discountAmount?: number;
  }> {
    const coupon = await this.findByCode(validateDto.code);

    if (!coupon) {
      return { valid: false, message: 'Cupón no encontrado' };
    }

    if (!coupon.isActive) {
      return { valid: false, message: 'Cupón inactivo' };
    }

    // Validar fechas
    const now = new Date();
    if (now < coupon.startDate) {
      return { valid: false, message: 'Cupón aún no válido' };
    }

    if (coupon.endDate && now > coupon.endDate) {
      return { valid: false, message: 'Cupón expirado' };
    }

    // Validar límite de usos
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'Cupón ha alcanzado el límite de usos' };
    }

    // Validar límite por cliente
    if (coupon.usageLimitPerCustomer && validateDto.customerId) {
      const customerUsage = await this.prisma.order.count({
        where: {
          customerId: validateDto.customerId,
          couponId: coupon.id,
        },
      });

      if (customerUsage >= coupon.usageLimitPerCustomer) {
        return { valid: false, message: 'Has alcanzado el límite de usos de este cupón' };
      }
    }

    // Validar cliente elegible
    if (validateDto.customerId && coupon.customerTypes.length > 0) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: validateDto.customerId },
      });

      if (!customer) {
        return { valid: false, message: 'Cliente no encontrado' };
      }

      if (!coupon.customerTypes.includes(customer.type)) {
        return { valid: false, message: 'Cupón no disponible para tu tipo de cliente' };
      }

      // Validar primera compra
      if (coupon.isFirstPurchaseOnly && customer.totalOrders > 0) {
        return { valid: false, message: 'Cupón solo válido para primera compra' };
      }

      // Validar mínimo de órdenes
      if (coupon.minOrders && customer.totalOrders < coupon.minOrders) {
        return {
          valid: false,
          message: `Necesitas al menos ${coupon.minOrders} compras para usar este cupón`,
        };
      }
    }

    // Validar compra mínima
    if (coupon.minPurchase && validateDto.totalAmount) {
      if (Number(validateDto.totalAmount) < Number(coupon.minPurchase)) {
        return {
          valid: false,
          message: `Compra mínima requerida: $${coupon.minPurchase.toString()}`,
        };
      }
    }

    // Validar scope
    if (coupon.scope === 'PRODUCT' && coupon.productId) {
      if (!validateDto.productIds?.includes(coupon.productId)) {
        return { valid: false, message: 'Producto no elegible para este cupón' };
      }
    }

    if (coupon.scope === 'CATEGORY' && coupon.categoryId) {
      if (!validateDto.categoryIds?.includes(coupon.categoryId)) {
        return { valid: false, message: 'Categoría no elegible para este cupón' };
      }
    }

    // Calcular descuento
    let discountAmount = 0;
    if (validateDto.totalAmount) {
      if (coupon.type === 'PERCENTAGE') {
        discountAmount = (Number(validateDto.totalAmount) * Number(coupon.value)) / 100;

        // Aplicar descuento máximo si existe
        if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
          discountAmount = Number(coupon.maxDiscount);
        }
      } else {
        // FIXED
        discountAmount = Math.min(Number(coupon.value), Number(validateDto.totalAmount));
      }
    }

    return {
      valid: true,
      message: 'Cupón válido',
      coupon,
      discountAmount,
    };
  }

  async incrementUsage(id: string): Promise<void> {
    await this.prisma.coupon.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  // Método para obtener cupones auto-aplicables
  async getAutoApplicableCoupons(params: {
    customerId: string;
    productIds: string[];
    categoryIds: string[];
    totalAmount: number;
  }): Promise<Coupon[]> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: params.customerId },
    });

    if (!customer) {
      return [];
    }

    const now = new Date();

    // Buscar cupones auto-aplicables
    const coupons = await this.prisma.coupon.findMany({
      where: {
        isActive: true,
        autoApply: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
        customerTypes: {
          has: customer.type,
        },
      },
      include: {
        product: true,
        category: true,
      },
    });

    // Filtrar cupones que apliquen
    const applicableCoupons: Coupon[] = [];

    for (const coupon of coupons) {
      // Validar límites de uso
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        continue;
      }

      if (coupon.usageLimitPerCustomer) {
        const customerUsage = await this.prisma.order.count({
          where: {
            customerId: params.customerId,
            couponId: coupon.id,
          },
        });

        if (customerUsage >= coupon.usageLimitPerCustomer) {
          continue;
        }
      }

      // Validar primera compra
      if (coupon.isFirstPurchaseOnly && customer.totalOrders > 0) {
        continue;
      }

      // Validar mínimo de órdenes
      if (coupon.minOrders && customer.totalOrders < coupon.minOrders) {
        continue;
      }

      // Validar compra mínima
      if (coupon.minPurchase && params.totalAmount < Number(coupon.minPurchase)) {
        continue;
      }

      // Validar scope
      if (coupon.scope === 'PRODUCT' && coupon.productId) {
        if (!params.productIds.includes(coupon.productId)) {
          continue;
        }
      }

      if (coupon.scope === 'CATEGORY' && coupon.categoryId) {
        if (!params.categoryIds.includes(coupon.categoryId)) {
          continue;
        }
      }

      applicableCoupons.push(coupon);
    }

    return applicableCoupons;
  }
}
