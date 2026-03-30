import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponDto } from './dto/query-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Coupons')
@Controller('coupons')
@UseGuards(RolesGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create a new coupon' })
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Get all coupons with filters' })
  findAll(@Query() query: QueryCouponDto) {
    return this.couponsService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Get coupon by ID' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update coupon' })
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete coupon' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.couponsService.remove(id);
  }

  @Post('validate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate a coupon code' })
  @HttpCode(HttpStatus.OK)
  validateCoupon(@Body() validateDto: ValidateCouponDto) {
    return this.couponsService.validateCoupon(validateDto);
  }

  @Post(':id/increment-usage')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Increment coupon usage count' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async incrementUsage(@Param('id') id: string) {
    await this.couponsService.incrementUsage(id);
  }
}
