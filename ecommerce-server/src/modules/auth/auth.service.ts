import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { PasswordUtil } from '../../common/utils/password.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthResponseDto,
  UserResponseDto,
  TenantSummaryDto,
  ProfileResponseDto,
  SelectTenantResponseDto,
} from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { TenantMembership, Tenant } from '@prisma/client';

type MembershipWithTenant = TenantMembership & { tenant: Tenant };

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await PasswordUtil.hash(registerDto.password);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: 'STAFF',
        status: 'ACTIVE',
      },
    });

    const accessToken = this.generateToken({ sub: user.id, email: user.email });
    return { accessToken, user: this.mapUser(user) };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        tenantMemberships: { include: { tenant: true } },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await PasswordUtil.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');

    const memberships = user.tenantMemberships as MembershipWithTenant[];
    const activeMemberships = memberships.filter(
      (m) => m.tenant.status !== 'CANCELLED',
    );

    // SUPER_ADMIN without tenantSlug: platform-level login
    if (user.role === 'SUPER_ADMIN' && !loginDto.tenantSlug) {
      const accessToken = this.generateToken({ sub: user.id, email: user.email });
      return {
        accessToken,
        user: this.mapUser(user),
        availableTenants: activeMemberships.map(this.mapMembership),
      };
    }

    // No tenants at all
    if (activeMemberships.length === 0) {
      const accessToken = this.generateToken({ sub: user.id, email: user.email });
      return { accessToken, user: this.mapUser(user) };
    }

    // Resolve which tenant to log into
    let membership: MembershipWithTenant | undefined;

    if (loginDto.tenantSlug) {
      membership = activeMemberships.find((m) => m.tenant.slug === loginDto.tenantSlug);
      if (!membership) throw new UnauthorizedException('Tenant not found or access denied');
    } else if (activeMemberships.length === 1) {
      membership = activeMemberships[0];
    } else {
      // Multiple tenants — ask client to pick
      const accessToken = this.generateToken({ sub: user.id, email: user.email });
      return {
        accessToken,
        user: this.mapUser(user),
        availableTenants: activeMemberships.map(this.mapMembership),
      };
    }

    // Auto-save the selected tenant to the user record
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastTenantSelectedId: membership.tenantId,
        lastBranchSelectedId: null, // reset branch on new tenant
      },
    });

    const accessToken = this.generateToken({ sub: user.id, email: user.email });
    return {
      accessToken,
      user: this.mapUser(user),
      tenant: this.mapMembership(membership),
    };
  }

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantMemberships: { select: { tenantId: true, role: true } },
        lastTenantSelected: true,
      },
    });
    if (!user) throw new UnauthorizedException('User not found');

    let currentTenant: TenantSummaryDto | undefined;
    if (user.lastTenantSelected) {
      const membership = user.tenantMemberships.find(
        (m) => m.tenantId === user.lastTenantSelectedId,
      );
      currentTenant = {
        id: user.lastTenantSelected.id,
        name: user.lastTenantSelected.name,
        slug: user.lastTenantSelected.slug,
        memberRole: membership?.role ?? 'STAFF',
        plan: user.lastTenantSelected.plan,
      };
    }

    const { password, ...userWithoutPw } = user;
    return {
      user: this.mapUser(userWithoutPw as any),
      currentTenant,
      currentBranchId: user.lastBranchSelectedId ?? undefined,
    };
  }

  /** Save tenant selection to the user record. No new JWT needed. */
  async selectTenant(userId: string, tenantSlug: string): Promise<SelectTenantResponseDto> {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { userId, tenant: { slug: tenantSlug } },
      include: { tenant: true },
    });

    if (!membership) throw new UnauthorizedException('Tenant not found or access denied');
    if (membership.tenant.status === 'CANCELLED') {
      throw new BadRequestException('Tenant is not available');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastTenantSelectedId: membership.tenantId,
        lastBranchSelectedId: null, // reset branch when switching tenant
      },
    });

    return { tenant: this.mapMembership(membership as MembershipWithTenant) };
  }

  /** Save branch selection to the user record. */
  async selectBranch(userId: string, branchId: string): Promise<{ branchId: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastTenantSelectedId: true },
    });

    if (!user?.lastTenantSelectedId) {
      throw new BadRequestException('Select a tenant before selecting a branch');
    }

    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, tenantId: user.lastTenantSelectedId, status: 'ACTIVE' },
    });

    if (!branch) throw new NotFoundException('Branch not found or not accessible');

    await this.prisma.user.update({
      where: { id: userId },
      data: { lastBranchSelectedId: branchId },
    });

    return { branchId };
  }

  private generateToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  private mapUser(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  private mapMembership(m: MembershipWithTenant): TenantSummaryDto {
    return {
      id: m.tenant.id,
      name: m.tenant.name,
      slug: m.tenant.slug,
      memberRole: m.role,
      plan: m.tenant.plan,
    };
  }
}
