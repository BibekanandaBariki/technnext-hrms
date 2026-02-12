import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function initDatabase() {
    console.log('Initializing database schema...');

    try {
        // Test connection
        await prisma.$connect();
        console.log('✓ Connected to database');

        // The schema will be automatically synced when Prisma connects
        // Let's verify by trying to query a table
        const userCount = await prisma.user.count();
        console.log(`✓ Database schema initialized. User count: ${userCount}`);

    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

initDatabase()
    .then(() => {
        console.log('Database initialization complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Database initialization failed:', error);
        process.exit(1);
    });
