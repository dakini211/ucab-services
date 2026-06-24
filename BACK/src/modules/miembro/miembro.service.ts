import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      typeof value === 'bigint' ? Number(value) : value,
    ),
  );
}

function getTipoVinculacion(miembro: any): string {
  if (miembro.personal_ucab?.profesor) return 'Docente';
  if (miembro.personal_ucab?.administrativo) return 'Personal Administrativo';
  if (miembro.preparador) return 'Preparador';
  if (miembro.estudiante) return 'Estudiante';
  if (miembro.egresado) return 'Egresado';
  return 'Miembro';
}

@Injectable()
export class MiembroService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: {
    search?: string;
    tipoVinculacion?: string;
    estadoCuenta?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.estadoCuenta && query.estadoCuenta !== 'todos') {
      where.estado_cuenta = query.estadoCuenta;
    }

    if (query?.search) {
      const s = query.search;
      where.OR = [
        { primer_nombre: { contains: s, mode: 'insensitive' } },
        { primer_apellido: { contains: s, mode: 'insensitive' } },
        { correo_institucional: { contains: s, mode: 'insensitive' } },
      ];
      const asNum = parseInt(s);
      if (!isNaN(asNum)) {
        where.OR.push({ cedula_identidad: asNum });
      }
    }

    const include = {
      estudiante: true,
      egresado: true,
      personal_ucab: {
        include: { profesor: true, administrativo: true },
      },
    };

    const [miembros, total] = await Promise.all([
      this.prisma.miembro.findMany({ where, include, skip, take: limit, orderBy: { primer_apellido: 'asc' } }),
      this.prisma.miembro.count({ where }),
    ]);

    const data = miembros
      .filter((m) => {
        if (!query?.tipoVinculacion || query.tipoVinculacion === 'todos') return true;
        return getTipoVinculacion(m) === query.tipoVinculacion;
      })
      .map((m) => ({
        id: Number(m.id_miembro),
        cedula: `V-${m.cedula_identidad.toLocaleString('es-VE')}`,
        nombre: `${m.primer_nombre}${m.segundo_nombre ? ' ' + m.segundo_nombre : ''} ${m.primer_apellido}${m.segundo_apellido ? ' ' + m.segundo_apellido : ''}`.trim(),
        correo: m.correo_institucional,
        telefono: m.telefono,
        fecha_nacimiento: m.fecha_nacimiento,
        estado_cuenta: m.estado_cuenta,
        tipo_vinculacion: getTipoVinculacion(m),
        total_sesiones: m.total_sesiones,
      }));

    return serializeBigInt({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  async findOne(id: any) {
    const m = await this.prisma.miembro.findUnique({
      where: { id_miembro: BigInt(id) },
      include: {
        estudiante: true,
        egresado: true,
        personal_ucab: { include: { profesor: true, administrativo: true } },
        historial_contrasena: { where: { fecha_fin: null }, take: 1 },
      },
    });
    if (!m) return null;
    return serializeBigInt({
      ...m,
      id: Number(m.id_miembro),
      tipo_vinculacion: getTipoVinculacion(m),
    });
  }

  async create(createDto: any) {
    const result = await this.prisma.miembro.create({ data: createDto });
    return serializeBigInt(result);
  }

  async update(id: any, updateDto: any) {
    const result = await this.prisma.miembro.update({
      where: { id_miembro: BigInt(id) },
      data: updateDto,
    });
    return serializeBigInt(result);
  }

  async updateEstado(id: any, estado: string) {
    const result = await this.prisma.miembro.update({
      where: { id_miembro: BigInt(id) },
      data: { estado_cuenta: estado },
    });
    return serializeBigInt(result);
  }

  async remove(id: any) {
    const result = await this.prisma.miembro.delete({
      where: { id_miembro: BigInt(id) },
    });
    return serializeBigInt(result);
  }
}
