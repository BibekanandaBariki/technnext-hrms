import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Post()
    @Roles(Role.HR, Role.ADMIN)
    create(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.employeesService.create(createEmployeeDto);
    }

    @Get()
    @Roles(Role.HR, Role.ADMIN, Role.MANAGER)
    findAll() {
        return this.employeesService.findAll();
    }

    @Get(':id')
    // Allow employee to view only their own profile? Handled by service logic usually or separate endpoint 'me'
    // For now, standard CRUD
    findOne(@Param('id') id: string) {
        return this.employeesService.findOne(id);
    }
}
