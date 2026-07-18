# UCAB-Services

Plataforma de gestión de servicios electrónicos de la Universidad Católica Andrés Bello.
Sistema transaccional (OLTP) que integra los campus de Montalbán y Guayana.

## Ambiente de desarrollo

| Componente | Tecnología |
|---|---|
| **SGBD** | PostgreSQL 16 (PL/pgSQL) |
| **Backend** | NestJS 11 + Prisma 7 + JWT/Passport |
| **Frontend** | Angular 21 (standalone components) |
| **Runtime** | Node.js 20+ |

---

## 1. Base de datos

### 1.1 Crear la base

```bash
createdb -U postgres services_ucab
```

### 1.2 Ejecutar los scripts en este orden

Es importante mantener el orden de ejecución. Los datos de prueba dependen de que los triggers y procedimientos ya existan en la base de datos para funcionar correctamente.

```bash
psql -U postgres -d services_ucab -f DROP.sql                    # 1. limpieza
psql -U postgres -d services_ucab -f CREATE.sql                  # 2. tablas + constraints
psql -U postgres -d services_ucab -f INSERT.sql                  # 3. datos base
psql -U postgres -d services_ucab -f procedures_finacieros.sql   # 4. funciones + triggers
psql -U postgres -d services_ucab -f pl_financiero.sql           # 5. procedimientos financieros
psql -U postgres -d services_ucab -f pl_familiar_y_oferta.sql    # 6. procedimientos varios
psql -U postgres -d services_ucab -f INSERT_FINANCIERO.sql       # 7. datos del módulo financiero
psql -U postgres -d services_ucab -f insert_faltantes.sql        # 8. datos de entidades restantes
psql -U postgres -d services_ucab -f seguridad.sql               # 9. roles, cuentas y privilegios
```

### 1.3 Verificar datos insertados

Es recomendable verificar que todas las entidades tengan registros cargados correctamente.

```sql
ANALYZE;

SELECT relname AS tabla, n_live_tup AS filas
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup ASC, relname;
```

Si alguna tabla no tiene registros, puedes verificar los scripts de inserción.

### 1.4 Estado esperado tras la carga

```sql
SELECT numero_de_control, estatus, saldo FROM Factura ORDER BY numero_de_control;
```

| N.º de control | Estatus | Saldo |
|---|---|---|
| FAC-2026-000001 | pagada | 0.00 |
| FAC-2026-000002 | parcial | 53.68 |
| FAC-2026-000003 | pagada | 0.00 |

---

## 2. Backend

```bash
cd BACK
npm install
```

Crear `BACK/.env`:

```env
DATABASE_URL="postgresql://svc_app:cambiar_esto_app@localhost:5432/services_ucab?schema=public"
```

> **Nota de seguridad:** el usuario es `svc_app`, no `postgres`. Lo crea
> `seguridad.sql`. contrasena:123456.
> Si `seguridad.sql` no se ha ejecutado, usa `postgres` temporalmente.

Generar el cliente de Prisma y levantar:

```bash
npx prisma db pull      # introspecta el esquema real
npx prisma generate     # genera el cliente tipado
npm run start:dev       # http://localhost:3000/api
```

Verificar:

```bash
curl http://localhost:3000/api/health
```

---

## 3. Frontend

```bash
cd FRONT
npm install
npm start               # http://localhost:4200
```

El backend debe estar corriendo en el puerto 3000 (el CORS ya está configurado
para `http://localhost:4200`).

---

## 4. Credenciales de prueba

| Usuario | Correo | Rol |
|---|---|---|
| Carlos Ramírez | `c.ramirez@ucab.edu.ve` | Estudiante |
| Elena Castillo | `e.castillo@ucab.edu.ve` | Profesor |

Las contraseñas están en `INSERT.sql`, tabla `Historial_Contrasena`.

---

## 5. Arquitectura: dónde vive la lógica

**La lógica de negocio reside principalmente en PostgreSQL.** El backend invoca los procedimientos, 
y delega al gestor el cálculo de totales, saldos y estatus de las facturas.

Consecuencia práctica: si alguien inserta un pago con `psql`, por fuera de la
aplicación, el saldo de la factura se actualiza igual.

### Reglas automatizadas en el gestor

| Mecanismo | Regla |
|---|---|
| `trg_congelar_precio_item` | El precio se toma de `Historico_Tarifa` a la fecha del cargo y queda congelado |
| `trg_bloquear_folio_facturado` | Un folio facturado no admite cambios en sus ítems |
| `trg_actualizar_saldo_factura` | Al insertar un pago, recalcula el saldo y marca `pagada` |
| `sp_generar_factura` | Convierte un folio en factura consolidando sus cargos |
| `sp_cierre_masivo_folios` | Cierre mensual: factura todos los folios abiertos |
| `sp_aplicar_oferta_laboral` | Valida mayoría de edad, cuenta activa y no duplicar postulación |
| `fn_total_folio` | Atributo derivado `Total` del ER: se calcula, no se almacena |

### Paginado, búsqueda y ordenamiento

Los tres se resuelven **en el servidor** (`LIMIT`/`OFFSET`/`ORDER BY`), no en el
navegador. Las columnas ordenables pasan por una lista blanca en
`BACK/src/common/utils/pagination.util.ts`: `ORDER BY` no admite parámetros en
PostgreSQL, así que sin esa lista `?sortBy=` sería una inyección SQL directa.

---

## 6. Seguridad

Hay **dos capas**, y hacen falta las dos:

| Capa | Dónde | Qué protege |
|---|---|---|
| Aplicación | JWT + guards de NestJS | Qué ve cada rol en la interfaz |
| **Gestor** | `sql/seguridad.sql` | Qué puede hacer cada cuenta **aunque se conecte por psql** |

Ambas capas son importantes. La seguridad a nivel del gestor garantiza la integridad incluso
si el acceso a la base de datos se realiza de forma directa (por ejemplo, vía psql).

| Rol | Puede |
|---|---|
| `ucab_admin` | DML completo. **No** DDL: no puede hacer DROP TABLE |
| `ucab_finanzas` | Lee todo; escribe solo en el módulo financiero. **Sin DELETE** |
| `ucab_miembro` | Lee catálogos y sus datos; crea solicitudes y pagos |
| `ucab_consulta` | Solo lectura (reportes) |

Cuentas: `svc_app` (la aplicación) y `svc_reportes` (solo lectura).

Demostración para la corrección:

```sql
SET ROLE ucab_finanzas;
DELETE FROM Factura WHERE numero_de_control = 'FAC-2026-000001';
-- ERROR: permiso denegado para la tabla factura
RESET ROLE;
```
---

## 7. Estructura del repositorio

```
BACK/          API NestJS
  src/modules/   un módulo por entidad
  src/common/    filtros y utilidades compartidas
  prisma/        schema.prisma
FRONT/         Aplicación Angular
  src/app/pages/     páginas
  src/app/services/  clientes HTTP
sql/           Scripts de base de datos
docs/          Modelo E-R corregido
```
