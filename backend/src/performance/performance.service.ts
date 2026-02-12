import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { GoalStatus } from '@prisma/client';

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) {}

  async createGoal(userId: string, dto: CreateGoalDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) throw new NotFoundException('Employee profile not found');

    return this.prisma.goal.create({
      data: {
        employeeId: employee.id,
        title: dto.title,
        description: dto.description,
        quarter: dto.quarter,
        year: dto.year,
        targetDate: new Date(dto.targetDate),
        status: GoalStatus.IN_PROGRESS,
      },
    });
  }

  async findAllGoals(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) throw new NotFoundException('Employee profile not found');

    return this.prisma.goal.findMany({
      where: { employeeId: employee.id },
      orderBy: { targetDate: 'asc' },
    });
  }

  // Simplified review logic for brevity
  async getTeamGoals(managerUserId: string) {
    const manager = await this.prisma.employee.findUnique({
      where: { userId: managerUserId },
    });
    if (!manager) throw new NotFoundException('Manager profile not found');

    return this.prisma.goal.findMany({
      where: { employee: { reportingManagerId: manager.id } },
      include: { employee: true },
    });
  }
}
