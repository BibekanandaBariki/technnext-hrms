import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

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
    });
