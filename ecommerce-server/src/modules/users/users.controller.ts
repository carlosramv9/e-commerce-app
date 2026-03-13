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
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { IsArray, IsUUID, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { UsersService, PermissionGrantInput } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

class SetRolesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];
}

class PermissionGrantDto implements PermissionGrantInput {
  @IsUUID('4')
  permissionId: string;

  @IsBoolean()
  granted: boolean;
}

class SetPermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionGrantDto)
  grants: PermissionGrantDto[];
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get all users with pagination' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get(':id/roles')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get user roles and permission grants' })
  findOneWithRoles(@Param('id') id: string) {
    return this.usersService.findOneWithRoles(id);
  }

  @Put(':id/roles')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Replace all role assignments for a user' })
  @ApiBody({ type: SetRolesDto })
  setRoles(@Param('id') id: string, @Body() body: SetRolesDto) {
    return this.usersService.setRoles(id, body.roleIds);
  }

  @Put(':id/permissions')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Replace all individual permission grants for a user' })
  @ApiBody({ type: SetPermissionsDto })
  setPermissions(@Param('id') id: string, @Body() body: SetPermissionsDto) {
    return this.usersService.setPermissions(id, body.grants);
  }

  @Get(':id/effective-permissions')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get effective permission keys for a user' })
  getEffectivePermissions(@Param('id') id: string) {
    return this.usersService.getEffectivePermissions(id);
  }
}
