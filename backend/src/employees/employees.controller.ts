import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
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
    @Roles(Role.HR, Role.ADMIN, Role.MANAGER)
    findOne(@Param('id') id: string) {
        return this.employeesService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.HR, Role.ADMIN)
    update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
        return this.employeesService.update(id, updateEmployeeDto);
    }
}
