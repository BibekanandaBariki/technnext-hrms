import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    const emailsToDelete = ['employee@technnexthrms.com', 'bibekbariki786@gmail.com'];

    for (const email of emailsToDelete) {
        console.log(`Looking up: ${email}`);
        const userRes = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);

        if (userRes.rows.length > 0) {
            const userId = userRes.rows[0].id;
            console.log(`Found user: ${email} (ID: ${userId})`);

            const empRes = await pool.query('SELECT id, "employeeId" FROM "Employee" WHERE "userId" = $1', [userId]);

            if (empRes.rows.length > 0) {
                const empId = empRes.rows[0].id;
                console.log(`Found employee record: ${empRes.rows[0].employeeId}. Deleting...`);

                // Delete related records manually to avoid foreign key issues
                await pool.query('DELETE FROM "LeaveBalance" WHERE "employeeId" = $1', [empId]);
                await pool.query('DELETE FROM "Leave" WHERE "employeeId" = $1', [empId]);
                await pool.query('DELETE FROM "Attendance" WHERE "employeeId" = $1', [empId]);
                await pool.query('DELETE FROM "PerformanceReview" WHERE "employeeId" = $1', [empId]);
                await pool.query('DELETE FROM "ProbationReview" WHERE "employeeId" = $1', [empId]);
                await pool.query('DELETE FROM "Goal" WHERE "employeeId" = $1', [empId]);
                await pool.query('DELETE FROM "TaxDeclaration" WHERE "employeeId" = $1', [empId]);
                await pool.query('DELETE FROM "SalaryStructure" WHERE "employeeId" = $1', [empId]);
                await pool.query('DELETE FROM "EmployeeDocument" WHERE "employeeId" = $1', [empId]);

                const payrollRes = await pool.query('SELECT id FROM "PayrollRecord" WHERE "employeeId" = $1', [empId]);
                if (payrollRes.rows.length > 0) {
                    const payrollIds = payrollRes.rows.map((r: any) => r.id);
                    const inClause = payrollIds.map((_: any, i: number) => `$${i + 1}`).join(',');
                    await pool.query(`DELETE FROM "Payslip" WHERE "payrollRecordId" IN (${inClause})`, payrollIds);
                }
                await pool.query('DELETE FROM "PayrollRecord" WHERE "employeeId" = $1', [empId]);
                await pool.query('DELETE FROM "Employee" WHERE id = $1', [empId]);
            }

            console.log(`Deleting user record: ${email}...`);
            await pool.query('DELETE FROM "Session" WHERE "userId" = $1', [userId]);
            await pool.query('DELETE FROM "PasswordHistory" WHERE "userId" = $1', [userId]);
            await pool.query('DELETE FROM "AuditLog" WHERE "userId" = $1', [userId]);
            await pool.query('DELETE FROM "User" WHERE id = $1', [userId]);
            console.log(`Deleted ${email} successfully.`);
        } else {
            console.log(`User ${email} not found.`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
    });
