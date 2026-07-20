import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const url = process.env.DATABASE_URL || '';
    if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
      const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
      const pool = new Pool({
        connectionString: url,
        ssl: isLocal ? undefined : { rejectUnauthorized: false },
      });
      super({ adapter: new PrismaPg(pool) });
    } else {
      super({ accelerateUrl: url });
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
