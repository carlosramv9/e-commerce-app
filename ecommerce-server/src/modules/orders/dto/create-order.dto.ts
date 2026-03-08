import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ minimum: 0 })
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Omitir = venta general (mostrador)' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ example: 'CASH', description: 'Método de pago: CASH, CARD, etc.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  paymentMethod: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ description: 'Código de cupón a aplicar' })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
