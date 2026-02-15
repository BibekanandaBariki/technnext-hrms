import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const [
      totalEmployees,
      activeEmployees,
      pendingOnboarding,
      pendingDocuments,
      payrollDraft,
      payrollProcessed,
      payrollPaid,
      onLeaveToday,
    ] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
      this.prisma.employee.count({ where: { status: 'ONBOARDING' } }),
      this.prisma.employeeDocument.count({ where: { status: 'PENDING' } }),
      this.prisma.payrollRecord.count({ where: { status: 'DRAFT' } }),
      this.prisma.payrollRecord.count({ where: { status: 'PROCESSED' } }),
      this.prisma.payrollRecord.count({ where: { status: 'PAID' } }),
      this.prisma.attendance.count({
        where: {
          date: new Date(),
          attendanceType: 'LEAVE',
        },
      }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      pendingOnboarding,
      pendingDocuments,
      payrollDraft,
      payrollProcessed,
      payrollPaid,
      onLeaveToday,
    };
  }
}
