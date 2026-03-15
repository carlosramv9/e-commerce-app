import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthResponseDto,
  ProfileResponseDto,
  SelectTenantResponseDto,
} from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile with active tenant/branch' })
  async getProfile(@CurrentUser() user: User): Promise<ProfileResponseDto> {
    return this.authService.getProfile(user.id);
  }

  @Patch('select-tenant/:slug')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Select active tenant — saves to user record, no new JWT needed' })
  selectTenant(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
  ): Promise<SelectTenantResponseDto> {
    return this.authService.selectTenant(user.id, slug);
  }

  @Patch('select-branch/:branchId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Select active branch — saves to user record' })
  selectBranch(
    @CurrentUser() user: User,
    @Param('branchId') branchId: string,
  ): Promise<{ branchId: string }> {
    return this.authService.selectBranch(user.id, branchId);
  }
}
