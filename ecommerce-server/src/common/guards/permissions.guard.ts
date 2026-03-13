import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // SUPER_ADMIN bypasses all permission checks
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const effectivePermissions = await this.getEffectivePermissions(user.id);

    return requiredPermissions.every((perm) =>
      effectivePermissions.includes(perm),
    );
  }

  private async getEffectivePermissions(userId: string): Promise<string[]> {
    // Get all permissions from all assigned roles
    const roleAssignments = await this.prisma.userRoleAssignment.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const rolePermissionKeys = new Set<string>();
    for (const assignment of roleAssignments) {
      for (const rp of assignment.role.permissions) {
        rolePermissionKeys.add(rp.permission.key);
      }
    }

    // Get individual grants/revokes
    const individualGrants = await this.prisma.userPermissionGrant.findMany({
      where: { userId },
      include: {
        permission: true,
      },
    });

    // Apply individual grants (add or remove)
    for (const grant of individualGrants) {
      if (grant.granted) {
        rolePermissionKeys.add(grant.permission.key);
      } else {
        rolePermissionKeys.delete(grant.permission.key);
      }
    }

    return Array.from(rolePermissionKeys);
  }
}
