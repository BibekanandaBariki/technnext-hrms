import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { LeaveStatus } from '@prisma/client';

@Injectable()
export class LeavesService {
    constructor(private prisma: PrismaService) { }

    async applyLeave(userId: string, dto: ApplyLeaveDto) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee) throw new NotFoundException('Employee profile not found');

        const start = new Date(dto.startDate);
        const end = new Date(dto.endDate);

        if (start > end) {
            throw new BadRequestException('Start date cannot be after end date');
        }

        // Calculate total days (simple logic, excluding weekends would be better but keeping it simple for now)
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return this.prisma.leave.create({
            data: {
                employeeId: employee.id,
                leaveType: dto.leaveType as any, // Cast to bypass DTO string literal vs Prisma enum
                startDate: start,
                endDate: end,
                reason: dto.reason,
                totalDays,
                status: LeaveStatus.PENDING,
            },
        });
    }

    async findAll(userId: string) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee) throw new NotFoundException('Employee profile not found');

        return this.prisma.leave.findMany({
            where: { employeeId: employee.id },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findAllPending() { // For HR/Manager
        return this.prisma.leave.findMany({
            where: { status: LeaveStatus.PENDING },
            include: { employee: true },
            orderBy: { createdAt: 'asc' },
        });
    }

    async updateStatus(id: string, status: LeaveStatus, approverId: string, rejectionReason?: string) {
        // In a real app, verify approver permissions/role here or in guard
        const leave = await this.prisma.leave.findUnique({ where: { id } });
        if (!leave) throw new NotFoundException('Leave request not found');

        return this.prisma.leave.update({
            where: { id },
            data: {
                status,
                approvedBy: approverId,
                approvedAt: new Date(),
                rejectionReason,
            }
        });
    }
}
