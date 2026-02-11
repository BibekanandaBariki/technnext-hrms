import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
    constructor(private readonly payrollService: PayrollService) { }

    @Post('salary-structure/:employeeId')
    @Roles(Role.HR, Role.ADMIN)
    setSalaryStructure(
        @Param('employeeId') employeeId: string,
        @Body() dto: CreateSalaryStructureDto,
        @GetUser() user: any
    ) {
        return this.payrollService.createOrUpdateSalaryStructure(employeeId, dto, user.id as string);
    }

    @Get('salary-structure/:employeeId')
    @Roles(Role.HR, Role.ADMIN)
    getSalaryStructure(@Param('employeeId') employeeId: string) {
        return this.payrollService.getSalaryStructure(employeeId);
    }

    @Post('process')
    @Roles(Role.HR, Role.ADMIN)
    processPayroll(
        @Query('year') year: number,
        @Query('month') month: number,
        @GetUser() user: any
    ) {
        return this.payrollService.processPayrollForMonth(Number(year), Number(month), user.id as string);
    }

    @Get('payslips')
    getMyPayslips(@GetUser() user: any) {
        return this.payrollService.getMyPayslips(user.id as string);
    }
}
