import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeclareTaxDto } from './dto/declare-tax.dto';
import { TaxDeclarationStatus } from '@prisma/client';

@Injectable()
export class TaxService {
    constructor(private prisma: PrismaService) { }

    async declareTax(userId: string, dto: DeclareTaxDto) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee) throw new NotFoundException('Employee profile not found');

        return this.prisma.taxDeclaration.upsert({
            where: {
                employeeId_financialYear: {
                    employeeId: employee.id,
                    financialYear: dto.financialYear,
                },
            },
            update: {
                ...dto,
                status: TaxDeclarationStatus.DRAFT, // Reset to draft on update
            },
            create: {
                employeeId: employee.id,
                ...dto,
            },
        });
    }

    async getMyDeclarations(userId: string) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee) throw new NotFoundException('Employee profile not found');

        return this.prisma.taxDeclaration.findMany({
            where: { employeeId: employee.id }
        });
    }
}
