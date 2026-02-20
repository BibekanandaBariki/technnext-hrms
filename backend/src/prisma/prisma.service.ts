import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    // Only use the PG adapter if it's a PostgreSQL connection string
    if (connectionString?.startsWith('postgres') || connectionString?.startsWith('postgresql')) {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      super({ adapter } as any);
    } else {
      // Fallback to default SQLite behavior for local development
      super();
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
