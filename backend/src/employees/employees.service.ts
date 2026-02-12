import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
@Injectable()
export class EmployeesService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    async create(createEmployeeDto: CreateEmployeeDto) {
        // Check if email exists
        const existing = await this.prisma.employee.findUnique({
            where: { email: createEmployeeDto.email },
        });
        if (existing) {
            throw new ConflictException('Employee with this email already exists');
        }

        // Generate Employee Code (Simple logic for now: EMP-YYYY-RANDOM)
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const employeeCode = `EMP-${year}-${random}`;

        // Create User account first (implicitly or explicitly? 
        // Spec says: "HR creating employee profile... System sends onboarding email... Employee sets password"
        // So we might need to create a User with a temporary password or just link it later.
        // For now, let's assume we create a User with a default password or handling it in a separate process.
        // But the Employee model has specific fields.
        // Actually, Employee has `userId` unique. So we NEED a user to create an employee.

        // Let's create a placeholder user or assume the request creates both. 
        // For simplicity in this step, I'll create a user with the employee email and a default password.

        // Generate random password
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            return await this.prisma.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                    data: {
                        email: createEmployeeDto.email,
                        passwordHash: hashedPassword,
                        role: 'EMPLOYEE',
                    }
                });

                const employee = await prisma.employee.create({
                    data: {
                        userId: user.id,
                        employeeCode,
                        firstName: createEmployeeDto.firstName,
                        lastName: createEmployeeDto.lastName,
                        email: createEmployeeDto.email,
                        joiningDate: new Date(createEmployeeDto.joiningDate), // Convert to Date object
                        departmentId: createEmployeeDto.departmentId,
                        designationId: createEmployeeDto.designationId,
                        employmentType: createEmployeeDto.employmentType as any,
                        reportingManagerId: createEmployeeDto.reportingManagerId,
                    },
                });

                // Send onboarding email
                // In dev environment, this will log to console
                const loginLink = 'http://localhost:3000/login';
                try {
                    await this.emailService.sendOnboardingEmail(
                        employee.email,
                        `${employee.firstName} ${employee.lastName}`,
                        password,
                        loginLink
                    );
                } catch (emailError) {
                    console.error('Failed to send onboarding email:', emailError);
                    // verified: do not fail transaction if email fails, but maybe we should?
                    // For now, log and proceed is safer for data consistency test.
                }

                return employee;
            });
        } catch (error) {
            console.error('Error creating employee:', error);
            throw error;
        }
    }

    async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
        const employee = await this.prisma.employee.findUnique({ where: { id } });
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${id} not found`);
        }

        // Prepare data for update
        const data: Prisma.EmployeeUpdateInput = {
            firstName: updateEmployeeDto.firstName,
            lastName: updateEmployeeDto.lastName,
            email: updateEmployeeDto.email, // If email changes, User email should also change? 
            // For simplicity, let's assume email update is handled carefully or not allowed here.
            // But if we allow it, we must update User too.
            // Let's implement User email update too if email is present.
            joiningDate: updateEmployeeDto.joiningDate,
            employmentType: updateEmployeeDto.employmentType as any,
            department: updateEmployeeDto.departmentId ? { connect: { id: updateEmployeeDto.departmentId } } : undefined,
            designation: updateEmployeeDto.designationId ? { connect: { id: updateEmployeeDto.designationId } } : undefined,
            reportingManager: updateEmployeeDto.reportingManagerId ? { connect: { id: updateEmployeeDto.reportingManagerId } } : undefined,
        };

        if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
            // Update User email as well
            await this.prisma.user.update({
                where: { id: employee.userId },
                data: { email: updateEmployeeDto.email }
            });
            data.email = updateEmployeeDto.email;
        }

        return this.prisma.employee.update({
            where: { id },
            data,
        });
    }

    async findAll() {
        return this.prisma.employee.findMany({
            include: {
                department: true,
                designation: true,
            }
        });
    }

    async findOne(id: string) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                department: true,
                designation: true,
                documents: true,
            }
        });
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${id} not found`);
        }
        return employee;
    }
}
