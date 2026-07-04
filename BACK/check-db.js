const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();
async function run() {
  const espacios = await p.espacio_fisico.findMany();
  console.log('ESPACIOS:', JSON.stringify(espacios, (k,v) => typeof v === 'bigint' ? v.toString() : v));
  const m = await p.miembro.findFirst();
  if (m) console.log('MIEMBRO:', JSON.stringify({id: Number(m.id_miembro), nombre: m.primer_nombre}));
  const sv = await p.servicio.findFirst();
  if (sv) console.log('SERVICIO:', JSON.stringify({id: sv.id_servicio, nombre: sv.nombre_servicio}));
  await p.$disconnect();
}
run().catch(e => { console.error(e.message); process.exit(1); });
