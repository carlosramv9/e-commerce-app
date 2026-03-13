import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditContextInterceptor } from './common/interceptors/audit-context.interceptor';
import { CouponsModule } from './modules/coupons/coupons.module';
import { EmailModule } from './modules/email/email.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CustomersModule,
    OrdersModule,
    DashboardModule,
    CouponsModule,
    EmailModule,
    PermissionsModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditContextInterceptor,
    },
  ],
})
export class AppModule {}
