const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════════════
// Configuración
// ═══════════════════════════════════════════════════════════════════════════════

// Modelos que ya fueron corregidos manualmente — NO se sobrescriben
const SKIP_MODELS = new Set([
  'miembro', 'sede', 'servicio', 'publica', 'opera',
  'organizacion_externa', 'familiar', 'factura',
  'entidad_propia', 'entidad_prestadora',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// Parser del schema de Prisma
// ═══════════════════════════════════════════════════════════════════════════════

function parseSchema(content) {
  const models = {};
  const modelRegex = /model\s+(\w+)\s*\{([^}]*)\}/gs;
  let match;
  while ((match = modelRegex.exec(content)) !== null) {
    models[match[1]] = parseModelBody(match[2]);
  }
  return models;
}

function parseModelBody(body) {
  const lines = body.split('\n');
  const fields = [];
  let compositePkFields = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    // @@id([field1, field2, ...], map: "...")
    const compMatch = trimmed.match(/@@id\(\[([^\]]+)\]/);
    if (compMatch) {
      compositePkFields = compMatch[1].split(',').map(s => s.trim());
      continue;
    }
    // Saltar otros decoradores de modelo (@@unique, etc.)
    if (trimmed.startsWith('@@')) continue;

    // Campo escalar: nombre  Tipo?  @decoradores
    const fm = trimmed.match(
      /^(\w+)\s+(BigInt|Int|String|DateTime|Decimal|Boolean|Float)(\?)?(.*)$/,
    );
    if (fm) {
      const [, name, type, opt, rest] = fm;
      fields.push({
        name,
        type,
        optional: !!opt,
        isId: /@id(?=\s|\(|$)/.test(rest),
        isAutoIncrement: rest.includes('autoincrement'),
        hasDefault: rest.includes('@default'),
      });
    }
    // Las líneas de relación (tipo = otro modelo) se ignoran automáticamente
  }

  // Determinar PK
  let pk = null;
  if (compositePkFields) {
    pk = { composite: true, fields: compositePkFields };
  } else {
    const idField = fields.find(f => f.isId);
    if (idField) {
      pk = { composite: false, field: idField.name, fieldType: idField.type };
    }
  }

  return { fields, pk };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers de tipos y nombres
// ═══════════════════════════════════════════════════════════════════════════════

/** Prisma type → TypeScript DTO type */
function tsType(prismaType) {
  const map = {
    BigInt: 'number',
    Int: 'number',
    String: 'string',
    DateTime: 'string',
    Decimal: 'number',
    Boolean: 'boolean',
    Float: 'number',
  };
  return map[prismaType] || 'any';
}

/** Genera la expresión de cast para el where de Prisma */
function castExpr(prismaType, expr) {
  switch (prismaType) {
    case 'BigInt':
      return `BigInt(${expr})`;
    case 'Int':
      return `Number(${expr})`;
    case 'DateTime':
      return `new Date(${expr})`;
    default:
      return expr; // String, Decimal, etc. → sin cast
  }
}

/** snake_case → PascalCase  (e.g. billetera_digital → BilleteraDigital) */
function toClassName(str) {
  return str
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

/** snake_case → kebab-case  (e.g. billetera_digital → billetera-digital) */
function toKebab(str) {
  return str.replace(/_/g, '-');
}

/** PascalCase → camelCase */
function lowerFirst(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Generadores de código
// ═══════════════════════════════════════════════════════════════════════════════

// ──────────────── DTOs ────────────────

function genCreateDto(className, modelInfo) {
  const lines = [`export class Create${className}Dto {`];
  for (const f of modelInfo.fields) {
    if (f.isAutoIncrement) continue; // campo autogenerado → omitir
    const opt = f.optional || f.hasDefault ? '?' : '';
    lines.push(`  ${f.name}${opt}: ${tsType(f.type)};`);
  }
  lines.push('}', '');
  return lines.join('\n');
}

function genUpdateDto(className, kebab) {
  return `import { PartialType } from '@nestjs/mapped-types';
import { Create${className}Dto } from './create-${kebab}.dto';

export class Update${className}Dto extends PartialType(Create${className}Dto) {}
`;
}

// ──────────────── Services ────────────────

function genService(model, className, kebab, info) {
  if (info.pk.composite) {
    return genCompositeService(model, className, kebab, info);
  }
  return genSinglePkService(model, className, kebab, info);
}

function genSinglePkService(model, className, kebab, info) {
  const { field: pkField, fieldType: pkType } = info.pk;
  const paramType = pkType === 'BigInt' ? 'string | number' : tsType(pkType);

  // Construir la expresión where
  let whereExpr;
  if (pkType === 'BigInt') {
    whereExpr = `{ ${pkField}: BigInt(${pkField}) }`;
  } else {
    whereExpr = `{ ${pkField} }`;
  }

  return `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Create${className}Dto } from './dto/create-${kebab}.dto';
import { Update${className}Dto } from './dto/update-${kebab}.dto';

@Injectable()
export class ${className}Service {
  constructor(private prisma: PrismaService) {}

  create(createDto: Create${className}Dto) {
    return this.prisma.${model}.create({ data: createDto });
  }

  findAll() {
    return this.prisma.${model}.findMany();
  }

  findOne(${pkField}: ${paramType}) {
    return this.prisma.${model}.findUnique({ where: ${whereExpr} });
  }

  update(${pkField}: ${paramType}, updateDto: Update${className}Dto) {
    return this.prisma.${model}.update({
      where: ${whereExpr},
      data: updateDto,
    });
  }

  remove(${pkField}: ${paramType}) {
    return this.prisma.${model}.delete({ where: ${whereExpr} });
  }
}
`;
}

function genCompositeService(model, className, kebab, info) {
  const pkFields = info.pk.fields;
  const compoundKey = pkFields.join('_');

  // Tipo del parámetro keys
  const keysType = pkFields
    .map(f => {
      const field = info.fields.find(fi => fi.name === f);
      return `${f}: ${tsType(field ? field.type : 'String')}`;
    })
    .join('; ');

  // Cuerpo interno del where compuesto
  const whereInnerLines = pkFields
    .map(f => {
      const field = info.fields.find(fi => fi.name === f);
      const cast = castExpr(field ? field.type : 'String', `keys.${f}`);
      return `          ${f}: ${cast},`;
    })
    .join('\n');

  return `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Create${className}Dto } from './dto/create-${kebab}.dto';
import { Update${className}Dto } from './dto/update-${kebab}.dto';

@Injectable()
export class ${className}Service {
  constructor(private prisma: PrismaService) {}

  create(createDto: Create${className}Dto) {
    return this.prisma.${model}.create({ data: createDto });
  }

  findAll() {
    return this.prisma.${model}.findMany();
  }

  findOne(keys: { ${keysType} }) {
    return this.prisma.${model}.findUnique({
      where: {
        ${compoundKey}: {
${whereInnerLines}
        },
      },
    });
  }

  update(keys: { ${keysType} }, updateDto: Update${className}Dto) {
    return this.prisma.${model}.update({
      where: {
        ${compoundKey}: {
${whereInnerLines}
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { ${keysType} }) {
    return this.prisma.${model}.delete({
      where: {
        ${compoundKey}: {
${whereInnerLines}
        },
      },
    });
  }
}
`;
}

// ──────────────── Controllers ────────────────

function genController(model, className, kebab, info) {
  if (info.pk.composite) {
    return genCompositeController(model, className, kebab, info);
  }
  return genSinglePkController(model, className, kebab, info);
}

function genSinglePkController(model, className, kebab, info) {
  const { field: pkField, fieldType: pkType } = info.pk;
  const svcVar = `${lowerFirst(className)}Service`;

  // Conversión del Param (siempre llega como string desde la URL)
  let paramConversion;
  if (pkType === 'Int') {
    paramConversion = `+${pkField}`;
  } else {
    paramConversion = pkField; // String o BigInt (el service hace BigInt())
  }

  return `import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ${className}Service } from './${kebab}.service';
import { Create${className}Dto } from './dto/create-${kebab}.dto';
import { Update${className}Dto } from './dto/update-${kebab}.dto';

@Controller('${kebab}')
export class ${className}Controller {
  constructor(private readonly ${svcVar}: ${className}Service) {}

  @Post()
  create(@Body() createDto: Create${className}Dto) {
    return this.${svcVar}.create(createDto);
  }

  @Get()
  findAll() {
    return this.${svcVar}.findAll();
  }

  @Get(':${pkField}')
  findOne(@Param('${pkField}') ${pkField}: string) {
    return this.${svcVar}.findOne(${paramConversion});
  }

  @Patch(':${pkField}')
  update(@Param('${pkField}') ${pkField}: string, @Body() updateDto: Update${className}Dto) {
    return this.${svcVar}.update(${paramConversion}, updateDto);
  }

  @Delete(':${pkField}')
  remove(@Param('${pkField}') ${pkField}: string) {
    return this.${svcVar}.remove(${paramConversion});
  }
}
`;
}

function genCompositeController(model, className, kebab, info) {
  const svcVar = `${lowerFirst(className)}Service`;

  return `import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { ${className}Service } from './${kebab}.service';
import { Create${className}Dto } from './dto/create-${kebab}.dto';
import { Update${className}Dto } from './dto/update-${kebab}.dto';

@Controller('${kebab}')
export class ${className}Controller {
  constructor(private readonly ${svcVar}: ${className}Service) {}

  @Post()
  create(@Body() createDto: Create${className}Dto) {
    return this.${svcVar}.create(createDto);
  }

  @Get()
  findAll() {
    return this.${svcVar}.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.${svcVar}.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: Update${className}Dto }) {
    return this.${svcVar}.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.${svcVar}.remove(keys);
  }
}
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Ejecución principal
// ═══════════════════════════════════════════════════════════════════════════════

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');
const models = parseSchema(schemaContent);

const total = Object.keys(models).length;
console.log(`\n📋 Encontrados ${total} modelos en el schema de Prisma.`);
console.log(`⏭️  Saltando (corregidos manualmente): ${[...SKIP_MODELS].join(', ')}\n`);

let fixed = 0;
let skipped = 0;

for (const [modelName, modelInfo] of Object.entries(models)) {
  if (SKIP_MODELS.has(modelName)) {
    skipped++;
    continue;
  }

  if (!modelInfo.pk) {
    console.log(`⚠️  ${modelName}: no se encontró PK → saltando`);
    skipped++;
    continue;
  }

  const kebab = toKebab(modelName);
  const className = toClassName(modelName);
  const moduleDir = path.join(__dirname, 'src', 'modules', kebab);

  // Si el directorio del módulo no existe, generar el recurso con Nest CLI
  if (!fs.existsSync(moduleDir)) {
    console.log(`📦 Generando recurso NestJS para: ${modelName}`);
    try {
      execSync(`npx nest g resource modules/${kebab} --no-spec --type rest`, {
        stdio: 'inherit',
      });
    } catch (e) {
      console.error(`❌ Error generando recurso ${modelName}:`, e.message);
      continue;
    }
  }

  // Asegurar que exista la carpeta dto
  const dtoDir = path.join(moduleDir, 'dto');
  if (!fs.existsSync(dtoDir)) {
    fs.mkdirSync(dtoDir, { recursive: true });
  }

  // Generar y escribir los 4 archivos
  fs.writeFileSync(
    path.join(dtoDir, `create-${kebab}.dto.ts`),
    genCreateDto(className, modelInfo),
  );
  fs.writeFileSync(
    path.join(dtoDir, `update-${kebab}.dto.ts`),
    genUpdateDto(className, kebab),
  );
  fs.writeFileSync(
    path.join(moduleDir, `${kebab}.service.ts`),
    genService(modelName, className, kebab, modelInfo),
  );
  fs.writeFileSync(
    path.join(moduleDir, `${kebab}.controller.ts`),
    genController(modelName, className, kebab, modelInfo),
  );

  // Log del resultado
  const pkDesc = modelInfo.pk.composite
    ? `compuesta(${modelInfo.pk.fields.join(', ')})`
    : `simple(${modelInfo.pk.field}: ${modelInfo.pk.fieldType})`;
  console.log(`✅ ${modelName} → PK: ${pkDesc}`);
  fixed++;
}

console.log(`\n🎉 Generación completa: ${fixed} corregidos, ${skipped} saltados.`);
