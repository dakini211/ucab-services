import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Leemos la URL de tu .env
    const connectionString = process.env.DATABASE_URL;
    
    // 2. Creamos la piscina de conexiones de Postgres
    const pool = new Pool({ connectionString });
    
    // 3. Inicializamos el adaptador de Prisma 7+
    const adapter = new PrismaPg(pool);
    
    // 4. Se lo pasamos al cliente
    super({ adapter }); 
  }

  async onModuleInit() {
    await this.$connect();
  }
}