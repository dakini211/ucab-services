const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Extraer todos los nombres de modelos
const modelRegex = /model\s+([a-zA-Z0-9_]+)\s+{/g;
const models = [];
let match;
while ((match = modelRegex.exec(schemaContent)) !== null) {
  models.push(match[1]);
}

console.log(`Encontrados ${models.length} modelos. Generando CRUD...`);

// Función para capitalizar (CamelCase)
function toClassName(str) {
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

// Función para kebab-case (para el CLI de Nest)
function toKebabCase(str) {
  return str.replace(/_/g, '-');
}

models.forEach(model => {
  const kebabName = toKebabCase(model);
  const className = toClassName(model);
  
  console.log(`\nGenerando recurso para: ${model} (${kebabName})`);
  
  try {
    // Generar el recurso REST
    execSync(`npx nest g resource modules/${kebabName} --no-spec --type rest`, { stdio: 'inherit' });
    
    // Sobrescribir el Service con la inyección de Prisma
    const servicePath = path.join(__dirname, 'src', 'modules', kebabName, `${kebabName}.service.ts`);
    
    const serviceContent = `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ${className}Service {
  constructor(private prisma: PrismaService) {}

  create(createDto: any) {
    return this.prisma.${model}.create({ data: createDto });
  }

  findAll() {
    return this.prisma.${model}.findMany();
  }

  findOne(id: any) {
    // TODO: Ajustar si la tabla usa llave primaria compuesta o si el ID no es número
    return this.prisma.${model}.findUnique({ where: { id_miembro: BigInt(id) } as any });
  }

  update(id: any, updateDto: any) {
    return this.prisma.${model}.update({
      where: { id_miembro: BigInt(id) } as any,
      data: updateDto,
    });
  }

  remove(id: any) {
    return this.prisma.${model}.delete({ where: { id_miembro: BigInt(id) } as any });
  }
}
`;
    
    fs.writeFileSync(servicePath, serviceContent, 'utf8');
    console.log(`Service de ${model} actualizado con Prisma.`);
    
  } catch (error) {
    console.error(`Error procesando modelo ${model}:`, error.message);
  }
});

console.log('Generación completa.');
