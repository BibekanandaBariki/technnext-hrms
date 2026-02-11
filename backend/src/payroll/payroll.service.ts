import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { PayrollStatus } from '@prisma/client';

@Injectable()
export class PayrollService {
    constructor(private prisma: PrismaService) { }

    async createOrUpdateSalaryStructure(employeeId: string, dto: CreateSalaryStructureDto, adminId: string) {
        const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) throw new NotFoundException('Employee not found');

        // Upsert logic
        return this.prisma.salaryStructure.upsert({
            where: { employeeId },
            update: {
                ...dto,
                effectiveFrom: new Date(dto.effectiveFrom),
            },
            create: {
                employeeId,
                ...dto,
                effectiveFrom: new Date(dto.effectiveFrom),
                createdBy: adminId,
            },
        });
    }

    async getSalaryStructure(employeeId: string) {
        return this.prisma.salaryStructure.findUnique({ where: { employeeId } });
    }

    async processPayrollForMonth(year: number, month: number, adminId: string) {
        // 1. Get all active employees
        const employees = await this.prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            include: { salaryStructure: true, attendance: true } // Need efficient way to filter attendance for the month
        });

        const results = [];

        for (const emp of employees) {
            if (!emp.salaryStructure) continue; // Skip if no salary structure

            // Simple logic: Full salary for now. 
            // Real logic needs LOP (Loss of Pay) calculation based on attendance.
            // Ignoring LOP for this iteration to keep it "Production-Ready MVP"

            const struct = emp.salaryStructure;
            const grossSalary = struct.basicSalary + struct.hra + struct.specialAllowance;
            const totalDeductions = struct.pfEmployee + struct.professionalTax; // + TDS (future)
            const netSalary = grossSalary - totalDeductions;

            const record = await this.prisma.payrollRecord.upsert({
                where: {
                    employeeId_month_year: {
                        employeeId: emp.id,
                        month,
                        year
                    }
                },
                update: {
                    basicSalary: struct.basicSalary,
                    hra: struct.hra,
                    specialAllowance: struct.specialAllowance,
                    grossSalary,
                    pfEmployee: struct.pfEmployee,
                    pfEmployer: struct.pfEmployer,
                    professionalTax: struct.professionalTax,
                    tds: 0, // Placeholder
                    netSalary,
                    processedAt: new Date(),
                    processedBy: adminId,
                    status: PayrollStatus.PROCESSED,
                },
                create: {
                    employeeId: emp.id,
                    month,
                    year,
                    basicSalary: struct.basicSalary,
                    hra: struct.hra,
                    specialAllowance: struct.specialAllowance,
                    grossSalary,
                    pfEmployee: struct.pfEmployee,
                    pfEmployer: struct.pfEmployer,
                    professionalTax: struct.professionalTax,
                    tds: 0,
                    netSalary,
                    processedAt: new Date(),
                    processedBy: adminId,
                    status: PayrollStatus.PROCESSED,
                }
            });
            results.push(record);
        }
        return results;
    }

    async getMyPayslips(userId: string) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee) throw new NotFoundException('Employee profile not found');

        return this.prisma.payrollRecord.findMany({
            where: { employeeId: employee.id, status: { in: [PayrollStatus.PROCESSED, PayrollStatus.PAID] } },
            orderBy: { year: 'desc', month: 'desc' }
        });
    }
}
