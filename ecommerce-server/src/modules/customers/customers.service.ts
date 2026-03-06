import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto';
import { Customer, CustomerStatus, CustomerType } from '@prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Customer>> {
    const { skip, limit, page } = paginationDto;

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { orders: true, addresses: true },
          },
        },
      }),
      this.prisma.customer.count(),
    ]);

    return {
      data: customers,
      meta: {
        page: page,
        limit: limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
    };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.prisma.customer.findUnique({
      where: { email: createCustomerDto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    return this.prisma.customer.create({
      data: {
        email: createCustomerDto.email,
        firstName: createCustomerDto.firstName,
        lastName: createCustomerDto.lastName,
        phone: createCustomerDto.phone ?? null,
        status: createCustomerDto.status ?? CustomerStatus.ACTIVE,
        type: createCustomerDto.type ?? CustomerType.NEW,
      },
    });
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (
      updateCustomerDto.email &&
      updateCustomerDto.email !== customer.email
    ) {
      const existing = await this.prisma.customer.findUnique({
        where: { email: updateCustomerDto.email },
      });
      if (existing) {
        throw new ConflictException('Email already registered');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }
}
