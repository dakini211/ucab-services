

const { Client } = require('pg');

// ── Configuración ───────────────────────────────────────────────────────────
const CFG = {
  host: 'localhost',
  port: 5432,
  database: 'bd-ucab-services',
};

const PG_PASSWORD = '1234';    // superusuario postgres
const APP_PASSWORD = '123456';  // svc_app, según seguridad.sql

// ── Utilidades ──────────────────────────────────────────────────────────────
let pasadas = 0;
let falladas = 0;

const ok = (msg) => {
  pasadas++;
  console.log(`  \x1b[32m OK \x1b[0m ${msg}`);
};

const fail = (msg, detalle) => {
  falladas++;
  console.log(`  \x1b[31mFALLA\x1b[0m ${msg}`);
  if (detalle) console.log(`        ${detalle}`);
};

/**
 * Espera que la consulta FALLE con un SQLSTATE concreto.
 *
 * Comparar el código importa: si el DELETE falla por un typo en el nombre de
 * la tabla (42P01), un test que solo mira "falló" lo celebraría como éxito.
 * Ese es el peor tipo de test: el que pasa cuando no debe.
 */
async function debeFallar(client, sql, sqlstate, descripcion) {
  try {
    await client.query(sql);
    fail(`${descripcion} — SE PERMITIO, y no debía`);
  } catch (e) {
    if (e.code === sqlstate) {
      ok(`${descripcion} — bloqueado (${e.code})`);
    } else {
      fail(`${descripcion} — falló, pero por otra razón`, `${e.code}: ${e.message}`);
    }
  }
}

async function debeFuncionar(client, sql, descripcion) {
  try {
    await client.query(sql);
    ok(descripcion);
  } catch (e) {
    fail(descripcion, `${e.code}: ${e.message}`);
  }
}

// ── Pruebas ─────────────────────────────────────────────────────────────────
async function main() {
  const admin = new Client({ ...CFG, user: 'postgres', password: PG_PASSWORD });

  try {
    await admin.connect();
  } catch (e) {
    console.error(`\nNo se pudo conectar como postgres: ${e.message}`);
    console.error(`Revisa CFG y PG_PASSWORD al inicio de este archivo.\n`);
    process.exit(1);
  }

  // ── 0. Roles creados ──────────────────────────────────────────────────────
  console.log('\n\x1b[1m0. Roles creados\x1b[0m');
  const roles = await admin.query(`
    SELECT rolname, rolsuper, rolcanlogin, rolcreatedb, rolcreaterole
    FROM pg_roles
    WHERE rolname LIKE 'ucab%' OR rolname LIKE 'svc%'
    ORDER BY rolname
  `);

  for (const r of ['svc_app', 'svc_reportes', 'ucab_admin', 'ucab_consulta', 'ucab_finanzas', 'ucab_miembro']) {
    if (roles.rows.find((x) => x.rolname === r)) ok(`${r} existe`);
    else fail(`${r} NO existe — ¿corriste seguridad.sql?`);
  }

  // ── 1. Privilegios de sistema ─────────────────────────────────────────────
  console.log('\n\x1b[1m1. Privilegios de sistema (mínimo privilegio)\x1b[0m');
  for (const r of roles.rows) {
    if (!r.rolsuper && !r.rolcreatedb && !r.rolcreaterole) {
      ok(`${r.rolname}: sin superusuario, sin crear bases ni roles`);
    } else {
      fail(`${r.rolname} tiene privilegios de sistema de más`,
        `super=${r.rolsuper} createdb=${r.rolcreatedb} createrole=${r.rolcreaterole}`);
    }
  }

  // ── 2. ucab_finanzas ──────────────────────────────────────────────────────
  console.log('\n\x1b[1m2. ucab_finanzas: cobra, pero no borra\x1b[0m');
  await admin.query('SET ROLE ucab_finanzas');

  await debeFuncionar(admin, 'SELECT 1 FROM Factura LIMIT 1', 'puede consultar facturas');

  // 42501 = insufficient_privilege
  await debeFallar(admin, `DELETE FROM Factura WHERE numero_de_control = 'FAC-2026-000001'`,
    '42501', 'no puede borrar una factura');
  await debeFallar(admin, `DELETE FROM Metodo_Pago WHERE numero_de_control = 'FAC-2026-000001'`,
    '42501', 'no puede borrar un pago');
  await debeFallar(admin, `CALL sp_cierre_masivo_folios('2026-07-01')`,
    '42501', 'no puede ejecutar el cierre masivo');

  await admin.query('RESET ROLE');

  // ── 3. ucab_consulta ──────────────────────────────────────────────────────
  console.log('\n\x1b[1m3. ucab_consulta: solo lectura\x1b[0m');
  await admin.query('SET ROLE ucab_consulta');

  await debeFuncionar(admin, 'SELECT 1 FROM Miembro LIMIT 1', 'puede leer');
  await debeFallar(admin, `UPDATE Factura SET estatus = 'anulada'`,
    '42501', 'no puede modificar');

  await admin.query('RESET ROLE');

  // ── 4. ucab_admin ─────────────────────────────────────────────────────────
  console.log('\n\x1b[1m4. ucab_admin: opera todo, pero no toca el esquema\x1b[0m');
  await admin.query('SET ROLE ucab_admin');

  await debeFuncionar(admin, 'SELECT 1 FROM Factura LIMIT 1', 'puede consultar');
  await debeFuncionar(admin, 'SELECT 1 FROM Miembro LIMIT 1', 'puede operar el negocio');

  // DROP y ALTER dependen de ser DUEÑO del objeto, y el dueño es postgres.
  await debeFallar(admin, 'DROP TABLE Factura', '42501', 'no puede hacer DROP TABLE');
  await debeFallar(admin, 'ALTER TABLE Factura ADD COLUMN hackeado TEXT', '42501',
    'no puede hacer ALTER TABLE');

  await admin.query('RESET ROLE');
  await admin.end();

  // ── 5. LA PRUEBA QUE DE VERDAD IMPORTA ────────────────────────────────────
  // Conectarse COMO svc_app, no con SET ROLE. Es lo que hace NestJS.
  // SET ROLE prueba los GRANT; esto prueba además que la cuenta se autentica
  // y que no arrastra los privilegios de postgres.
  console.log('\n\x1b[1m5. svc_app conectándose de verdad (lo que hace NestJS)\x1b[0m');

  const app = new Client({ ...CFG, user: 'svc_app', password: APP_PASSWORD });

  try {
    await app.connect();
    ok('svc_app puede autenticarse');

    const quien = await app.query(
      'SELECT current_user AS usuario, usesuper FROM pg_user WHERE usename = current_user'
    );

    if (quien.rows[0]?.usesuper === false) {
      ok(`conectado como "${quien.rows[0].usuario}" y NO es superusuario`);
    } else {
      fail('svc_app ES superusuario — una inyección SQL sigue siendo fatal');
    }

    await debeFuncionar(app, 'SELECT 1 FROM Factura LIMIT 1', 'puede operar el negocio');
    await debeFallar(app, 'DROP TABLE Factura', '42501',
      'una inyección SQL no puede tumbar la base');

    await app.end();
  } catch (e) {
    fail('svc_app no pudo conectarse', `${e.code}: ${e.message}`);
    if (e.code === '28P01') {
      console.log('        Contraseña incorrecta: revisa APP_PASSWORD arriba contra seguridad.sql.');
    } else if (e.code === '28000') {
      console.log('        pg_hba.conf está rechazando la conexión de svc_app.');
    }
  }

  // ── Resumen ───────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(52)}`);
  console.log(`  Pasadas: \x1b[32m${pasadas}\x1b[0m    Falladas: \x1b[31m${falladas}\x1b[0m`);
  console.log(`${'─'.repeat(52)}\n`);

  process.exit(falladas > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('\nError general:', e.message);
  process.exit(1);
});