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
    await prisma.user.deleteMany({
        where: {
            email: {
                in: emailsToDelete
            }
        }
    });
    console.log('Cleanup completed.');

    // Create Admin User
    const adminEmail = 'admin@technnexthrms.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash: hashedPassword,
                role: Role.ADMIN,
            },
        });
        console.log(`Created admin user: ${admin.email}`);
    } else {
        console.log('Admin user already exists.');
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
