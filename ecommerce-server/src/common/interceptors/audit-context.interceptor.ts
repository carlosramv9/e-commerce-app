import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditContextService } from '../context/audit-context.service';

@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  constructor(private readonly auditContext: AuditContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Usuario del JWT (si está autenticado)

    // Ejecutar el request handler dentro del contexto de auditoría
    return new Observable((subscriber) => {
      this.auditContext.run({ userId: user?.id }, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
