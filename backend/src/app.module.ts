import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeavesModule } from './leaves/leaves.module';
import { PayrollModule } from './payroll/payroll.module';
import { PerformanceModule } from './performance/performance.module';
import { TaxModule } from './tax/tax.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DepartmentsModule } from './departments/departments.module';
import { DesignationsModule } from './designations/designations.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    EmployeesModule,
    AttendanceModule,
    LeavesModule,
    PayrollModule,
    PerformanceModule,
    TaxModule,
    PerformanceModule,
    TaxModule,
    DashboardModule,
    DepartmentsModule,
    DesignationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
