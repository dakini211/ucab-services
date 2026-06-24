const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: 'postgresql://postgres:1002@localhost:5432/UCAB-SERVICES?schema=public' });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await prisma.historial_contrasena.updateMany({
    data: {
      contrasena: '123456'
    }
  });

  console.log('Todas las contraseñas han sido actualizadas a "123456" para propósitos de prueba.');
  await prisma.$disconnect();
}

main().catch(console.error);
