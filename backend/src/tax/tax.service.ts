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
                regime: dto.regime as any, // Cast to bypass DTO string literal vs Prisma enum
                section80C: dto.section80C,
                status: TaxDeclarationStatus.DRAFT, // Reset to draft on update
            },
            create: {
                employeeId: employee.id,
                financialYear: dto.financialYear,
                regime: dto.regime as any, // Cast to bypass DTO string literal vs Prisma enum
                section80C: dto.section80C,
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
