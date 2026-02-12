import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const totalEmployees = await this.prisma.employee.count();
    const activeEmployees = await this.prisma.employee.count({
      where: { status: 'ACTIVE' },
    });
    const onLeaveToday = await this.prisma.attendance.count({
      where: {
        date: new Date(), // This needs proper date handling (start of day)
        attendanceType: 'LEAVE',
      },
    });

    // Mocking some data for speed, real queries would be more complex
    return {
      totalEmployees,
      activeEmployees,
      onLeaveToday,
      departments: 5, // Mock
      openPositions: 3, // Mock
    };
  }
}
