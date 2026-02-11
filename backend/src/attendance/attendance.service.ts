/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PunchInDto } from './dto/punch-in.dto';
import { PunchOutDto } from './dto/punch-out.dto';
import { AttendanceType } from '@prisma/client';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) { }

    async punchIn(userId: string, dto: PunchInDto, ipAddress: string) {
        const employee = await (this.prisma as any).employee.findUnique({ where: { userId } });
        if (!employee) throw new NotFoundException('Employee profile not found');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await (this.prisma as any).attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: today,
            },
        });

        if (existing && existing.punchIn) {
            throw new BadRequestException('Already punched in for today');
        }

        // Determine if late (simplified logic: late if after 9:30 AM)
        const now = new Date();
        const shiftStart = new Date(now);
        shiftStart.setHours(9, 30, 0, 0); // Configurable in real app
        const isLate = now > shiftStart;

        if (existing) {
            // Update existing record if it was generated empty (e.g. by cron)
            return this.prisma.attendance.update({
                where: { id: existing.id },
                data: {
                    punchIn: now,
                    attendanceType: AttendanceType.PRESENT,
                    isLate,
                    ipAddress: dto.ipAddress || ipAddress,
                    location: dto.location,
                    remarks: dto.remarks,
                }
            });
        }

        return this.prisma.attendance.create({
            data: {
                employeeId: employee.id,
                date: today,
                punchIn: now,
                attendanceType: AttendanceType.PRESENT, // Initially present
                isLate,
                ipAddress: dto.ipAddress || ipAddress,
                location: dto.location,
                remarks: dto.remarks,
            },
        });
    }

    async punchOut(userId: string, dto: PunchOutDto) {
        const employee = await (this.prisma as any).employee.findUnique({ where: { userId } });
        if (!employee) throw new NotFoundException('Employee profile not found');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await (this.prisma as any).attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: today,
            },
        });

        if (!attendance || !attendance.punchIn) {
            throw new BadRequestException('No punch in record found for today');
        }

        if (attendance.punchOut) {
            throw new BadRequestException('Already punched out');
        }

        const now = new Date();
        // Calculate work hours
        const diffMs = now.getTime() - attendance.punchIn.getTime();
        const workHours = diffMs / (1000 * 60 * 60);

        // Determine status based on hours
        let type: AttendanceType = AttendanceType.PRESENT;
        if (workHours < 4) type = AttendanceType.HALF_DAY; // simplified rule

        // Check early departure (e.g. before 6:00 PM)
        const shiftEnd = new Date(now);
        shiftEnd.setHours(18, 0, 0, 0);
        const isEarlyDeparture = now < shiftEnd;

        return this.prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                punchOut: now,
                workHours,
                attendanceType: type,
                isEarlyDeparture,
            },
        });
    }

    async getTodayStatus(userId: string) {
        const employee = await (this.prisma as any).employee.findUnique({ where: { userId } });
        if (!employee) throw new NotFoundException('Employee profile not found');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (this.prisma as any).attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId: employee.id,
                    date: today
                }
            }
        })
    }

    async findAll(userId: string) { // For employee view
        const employee = await (this.prisma as any).employee.findUnique({ where: { userId } });
        if (!employee) throw new NotFoundException('Employee profile not found');

        return (this.prisma as any).attendance.findMany({
            where: { employeeId: employee.id },
            orderBy: { date: 'desc' },
            take: 30 // Last 30 days
        });
    }
}
