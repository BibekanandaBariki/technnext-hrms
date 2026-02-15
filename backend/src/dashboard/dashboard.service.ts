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

  async getManagerStats(userId: string) {
    const manager = await this.prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!manager) {
      return {
        teamSize: 0,
        teamPresentToday: 0,
        teamPendingLeaves: 0,
        teamGoalsInProgress: 0,
        reviewsThisQuarter: 0,
      };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const month = today.getMonth(); // 0-11
    const quarter = Math.floor(month / 3) + 1;
    const year = today.getFullYear();

    const [
      teamSize,
      teamPresentToday,
      teamPendingLeaves,
      teamGoalsInProgress,
      reviewsThisQuarter,
    ] = await Promise.all([
      this.prisma.employee.count({
        where: { reportingManagerId: manager.id },
      }),
      this.prisma.attendance.count({
        where: {
          date: today,
          attendanceType: 'PRESENT',
          employee: { reportingManagerId: manager.id },
        },
      }),
      this.prisma.leave.count({
        where: {
          status: 'PENDING',
          employee: { reportingManagerId: manager.id },
        },
      }),
      this.prisma.goal.count({
        where: {
          status: 'IN_PROGRESS',
          employee: { reportingManagerId: manager.id },
        },
      }),
      this.prisma.performanceReview.count({
        where: {
          year,
          quarter,
          employee: { reportingManagerId: manager.id },
        },
      }),
    ]);

    return {
      teamSize,
      teamPresentToday,
      teamPendingLeaves,
      teamGoalsInProgress,
      reviewsThisQuarter,
    };
  }
}
