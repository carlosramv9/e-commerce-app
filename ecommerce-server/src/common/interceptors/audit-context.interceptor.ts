import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from, switchMap } from 'rxjs';
import { AuditContextService } from '../context/audit-context.service';
import { TenantContextService } from '../context/tenant-context.service';
import { PrismaService } from '../../database/prisma.service';
import { TenantRole } from '@prisma/client';

@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  constructor(
    private readonly auditContext: AuditContextService,
    private readonly tenantContext: TenantContextService,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { id?: string } | undefined;

    return from(this.resolveContext(user?.id)).pipe(
      switchMap(({ tenantId, tenantRole, branchId }) =>
        new Observable((subscriber) => {
          this.tenantContext.run({ tenantId, tenantRole, branchId }, () => {
            this.auditContext.run({ userId: user?.id }, () => {
              next.handle().subscribe(subscriber);
            });
          });
        }),
      ),
    );
  }

  private async resolveContext(userId?: string): Promise<{
    tenantId?: string;
    tenantRole?: TenantRole;
    branchId?: string;
  }> {
    if (!userId) return {};

    const userRecord = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastTenantSelectedId: true,
        lastBranchSelectedId: true,
        tenantMemberships: {
          select: { tenantId: true, role: true },
        },
      },
    });

    if (!userRecord?.lastTenantSelectedId) return {};

    const tenantId = userRecord.lastTenantSelectedId;
    const branchId = userRecord.lastBranchSelectedId ?? undefined;
    const membership = userRecord.tenantMemberships.find(
      (m) => m.tenantId === tenantId,
    );

    return { tenantId, tenantRole: membership?.role, branchId };
  }
}
