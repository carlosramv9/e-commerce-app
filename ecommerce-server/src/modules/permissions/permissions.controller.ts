import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get all permissions grouped by module' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('flat')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get all permissions as a flat list' })
  findFlat() {
    return this.permissionsService.findFlat();
  }
}
