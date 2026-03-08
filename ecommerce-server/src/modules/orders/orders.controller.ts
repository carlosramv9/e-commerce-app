import { Controller, Get, Param, Patch, Body, Query, UseGuards, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OrderStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ordersService.findAll(paginationDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get order statistics' })
  getStats() {
    return this.ordersService.getStats();
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Create a new sale (order)' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }

  @Post(':id/send-receipt')
  @ApiOperation({ summary: 'Send order receipt by email' })
  @HttpCode(HttpStatus.OK)
  async sendReceipt(
    @Param('id') id: string,
    @Body('email') email: string,
  ) {
    // Obtener orden con todas las relaciones necesarias
    const order = await this.ordersService.findOne(id);

    // findOne ya incluye todas las relaciones necesarias
    const result = await this.emailService.sendReceipt(email, order as any);

    return {
      success: result.success,
      message: result.success
        ? 'Ticket enviado correctamente'
        : 'Error al enviar ticket',
      previewUrl: result.previewUrl, // Solo en desarrollo con Ethereal
    };
  }
}
