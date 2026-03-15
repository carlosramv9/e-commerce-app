import { UserRole, UserStatus, TenantRole, TenantPlan } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty({ enum: UserRole }) role: UserRole;
  @ApiProperty({ enum: UserStatus }) status: UserStatus;
  @ApiProperty() createdAt: Date;
}

export class TenantSummaryDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty({ enum: TenantRole }) memberRole: TenantRole;
  @ApiProperty({ enum: TenantPlan }) plan: TenantPlan;
}

export class AuthResponseDto {
  @ApiProperty() accessToken: string;
  @ApiProperty({ type: UserResponseDto }) user: UserResponseDto;
  @ApiPropertyOptional({ type: TenantSummaryDto }) tenant?: TenantSummaryDto;
  @ApiPropertyOptional({ type: [TenantSummaryDto] }) availableTenants?: TenantSummaryDto[];
}

export class ProfileResponseDto {
  @ApiProperty({ type: UserResponseDto }) user: UserResponseDto;
  @ApiPropertyOptional({ type: TenantSummaryDto }) currentTenant?: TenantSummaryDto;
  @ApiPropertyOptional() currentBranchId?: string;
}

export class SelectTenantResponseDto {
  @ApiProperty({ type: TenantSummaryDto }) tenant: TenantSummaryDto;
}
