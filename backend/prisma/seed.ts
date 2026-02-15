import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    // Cleanup specific users as requested
    const emailsToDelete = [
        'barikikanha709@gmail.com',
        'barikikanha998@gmail.com',
        'john.updated@technnexthrms.com'
    ];

    console.log(`Cleaning up ${emailsToDelete.length} users...`);

    // 1. Find users to delete
    const usersToDelete = await prisma.user.findMany({
        where: { email: { in: emailsToDelete } },
        select: { id: true }
    });

    const userIds = usersToDelete.map(u => u.id);

    if (userIds.length > 0) {
        console.log(`Found ${userIds.length} users to delete. Cleaning up related records...`);

        // 2. Delete related Employee records (and their dependencies if cascading isn't set)
        // Note: In a real prod env, we might want to soft-delete, but for this cleanup request we hard delete.

        // Find employee IDs to clean up their related data first
        const employeesToDelete = await prisma.employee.findMany({
            where: { userId: { in: userIds } },
            select: { id: true }
        });
        const employeeIds = employeesToDelete.map(e => e.id);

        if (employeeIds.length > 0) {
            // Delete Attendance
            await prisma.attendance.deleteMany({ where: { employeeId: { in: employeeIds } } });
            // Delete Leaves
            await prisma.leave.deleteMany({ where: { employeeId: { in: employeeIds } } });
            // Delete LeaveBalance
            await prisma.leaveBalance.deleteMany({ where: { employeeId: { in: employeeIds } } });
            // Delete Payroll
            await prisma.payrollRecord.deleteMany({ where: { employeeId: { in: employeeIds } } });
            // Delete TaxDeclaration
            await prisma.taxDeclaration.deleteMany({ where: { employeeId: { in: employeeIds } } });
            // Delete Documents
            await prisma.employeeDocument.deleteMany({ where: { employeeId: { in: employeeIds } } });
            // Delete Goals
            await prisma.goal.deleteMany({ where: { employeeId: { in: employeeIds } } });
            // Delete Performance Reviews
            await prisma.performanceReview.deleteMany({ where: { employeeId: { in: employeeIds } } });
            // Delete SalaryStructure
            await prisma.salaryStructure.deleteMany({ where: { employeeId: { in: employeeIds } } });

            // Finally delete Employees
            await prisma.employee.deleteMany({ where: { id: { in: employeeIds } } });
        }

        // 3. Delete AuditLogs and Sessions for these users
        await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.passwordHistory.deleteMany({ where: { userId: { in: userIds } } });

        // 4. Finally delete Users
        await prisma.user.deleteMany({
            where: { id: { in: userIds } }
        });
        console.log('Cleanup completed successfully.');
    } else {
        console.log('No users found to cleanup.');
    }

    // Create Admin User
    const adminEmail = 'admin@technnexthrms.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const adminPassword =
            process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash: hashedPassword,
                role: Role.ADMIN,
            },
        });
        console.log(`Created admin user: ${admin.email}`);
    } else {
        const resetAdmin =
            (process.env.ADMIN_RESET || '').toLowerCase() === 'true';
        if (resetAdmin) {
            const adminPassword =
                process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await prisma.user.update({
                where: { id: existingAdmin.id },
                data: {
                    passwordHash: hashedPassword,
                    passwordChangedAt: new Date(),
                },
            });
            console.log('Admin user password reset.');
        } else {
            console.log('Admin user already exists.');
        }
    }

    // Ensure Admin has an Employee profile for testing "My" features
    const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (adminUser) {
        const existingAdminEmployee = await prisma.employee.findUnique({ where: { userId: adminUser.id } });
        if (!existingAdminEmployee) {
            const adminDept = await prisma.department.upsert({
                where: { name: 'Management' },
                update: {},
                create: { name: 'Management', description: 'Executive Management' }
            });

            const adminDesig = await prisma.designation.upsert({
                where: { name: 'Administrator' },
                update: {},
                create: { name: 'Administrator', description: 'System Administrator' }
            });

            await prisma.employee.create({
                data: {
                    userId: adminUser.id,
                    firstName: 'Admin',
                    lastName: 'User',
                    email: adminEmail,
                    joiningDate: new Date(),
                    status: 'ACTIVE',
                    employeeCode: 'ADM-001',
                    departmentId: adminDept.id,
                    designationId: adminDesig.id
                }
            });
            console.log(`Created employee profile for admin: ${adminUser.email}`);
        } else {
            console.log('Admin employee profile already exists.');
        }
    }

    // Create Sample Employee
    const employeeEmail = 'employee@technnexthrms.com';
    const existingEmployee = await prisma.user.findUnique({ where: { email: employeeEmail } });

    if (!existingEmployee) {
        const hashedPassword = await bcrypt.hash('employee123', 10);
        const user = await prisma.user.create({
            data: {
                email: employeeEmail,
                passwordHash: hashedPassword,
                role: Role.EMPLOYEE,
            },
        });

        // Create Employee Profile linked to User
        await prisma.employee.create({
            data: {
                userId: user.id,
                firstName: 'John',
                lastName: 'Doe',
                email: employeeEmail,
                joiningDate: new Date(),
                status: 'ACTIVE',
                employeeCode: 'EMP-001'
            }
        });

        console.log(`Created sample employee: ${user.email}`);
    } else {
        console.log('Sample employee already exists.');
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
