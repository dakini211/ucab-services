import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    try {
      await this.$executeRaw`CALL sp_sincronizar_total_sesiones();`;
      console.log('Procedimiento sp_sincronizar_total_sesiones ejecutado con éxito en el arranque.');
    } catch (error) {
      console.error('Error ejecutando sp_sincronizar_total_sesiones:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
