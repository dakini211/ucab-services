const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const where = {};
    const skip = 0;
    const limit = 10;
    const include = {
      publica: {
        include: {
          entidad_prestadora: {
            include: { opera: true }
          }
        }
      }
    };
    const data = await prisma.servicio.findMany({
      where, skip, take: limit, include
    });
    console.log(data);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
