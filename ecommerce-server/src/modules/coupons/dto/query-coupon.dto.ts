import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType, CouponScope } from '@prisma/client';

export class QueryCouponDto {
  @ApiPropertyOptional({ example: 'WELCOME' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: CouponType })
  @IsEnum(CouponType)
  @IsOptional()
  type?: CouponType;

  @ApiPropertyOptional({ enum: CouponScope })
  @IsEnum(CouponScope)
  @IsOptional()
  scope?: CouponScope;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  autoApply?: boolean;
}
