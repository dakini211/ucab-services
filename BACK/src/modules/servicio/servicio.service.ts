import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ServicioService {
  constructor(private prisma: PrismaService) {}

  private mapServicio(s: any) {
    const entidad = s.publica?.entidad_prestadora;
    const sedes = entidad?.opera?.map((o: any) => o.nombre_sede) || [];
    const sedeStr = sedes.length > 0 ? sedes.join(', ') : 'Sede Montalbán';

    return {
      id: s.id_servicio,
      nombre: s.nombre_servicio,
      descripcion: s.descripcion || 'Sin descripción',
      categoria: entidad?.categoria || 'General',
      sede: sedeStr,
      tipo: 'Presencial', // Valor por defecto ya que no existe en DB
      precio_base: Number(s.costo) || 0,
      estado: s.publica ? 'Publicado' : 'Borrador',
    };
  }

  async create(createDto: any) {
    // Buscar el ID máximo para simular autoincrement
    const maxServicio = await this.prisma.servicio.aggregate({
      _max: { id_servicio: true }
    });
    const nextId = (maxServicio._max.id_servicio || 0) + 1;

    // Crear el servicio base
    const s = await this.prisma.servicio.create({
      data: {
        id_servicio: nextId,
        nombre_servicio: createDto.nombre,
        descripcion: createDto.descripcion,
        costo: createDto.precio_base || 0,
      },
    });

    // Opcionalmente, si nos mandaron categoría y sede, deberíamos crear una entidad prestadora genérica 
    // y publicarlo para que se relacione. Para mantenerlo simple, lo devolveremos como Borrador.
    return this.mapServicio(s);
  }

  async findAll(params: { search?: string; categoria?: string; sede?: string; estado?: string; tipo?: string; page: number; limit: number }) {
    const { search, categoria, sede, estado, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.nombre_servicio = { contains: search, mode: 'insensitive' };
    }
    
    // Filtros de relaciones
    if (categoria || sede || estado) {
      const publicaWhere: any = {};
      let hasPublicaFilter = false;

      if (categoria && categoria !== 'todas') {
        publicaWhere.entidad_prestadora = { categoria };
        hasPublicaFilter = true;
      }
      if (sede && sede !== 'todas') {
        if (!publicaWhere.entidad_prestadora) publicaWhere.entidad_prestadora = {};
        publicaWhere.entidad_prestadora.opera = { some: { nombre_sede: sede } };
        hasPublicaFilter = true;
      }

      if (estado === 'Borrador') {
        where.publica = null;
      } else if (estado === 'Publicado') {
        where.publica = { isNot: null, ...(hasPublicaFilter ? publicaWhere : {}) };
      } else if (hasPublicaFilter) {
        where.publica = publicaWhere;
      }
    }

    const include = {
      publica: {
        include: {
          entidad_prestadora: {
            include: { opera: true }
          }
        }
      }
    };

    const [data, total] = await Promise.all([
      this.prisma.servicio.findMany({
        where,
        skip,
        take: limit,
        include,
      }),
      this.prisma.servicio.count({ where }),
    ]);

    return {
      data: data.map((s) => this.mapServicio(s)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSedes() {
    const sedes = await this.prisma.sede.findMany({ select: { nombre_sede: true } });
    return sedes.map((s) => s.nombre_sede);
  }

  async getCategorias() {
    const entidades = await this.prisma.entidad_prestadora.findMany({
      select: { categoria: true },
      distinct: ['categoria'],
    });
    return entidades.map((e) => e.categoria).filter(Boolean);
  }

  async getStats() {
    const totalServicios = await this.prisma.servicio.count();
    const publicados = await this.prisma.publica.count();
    
    return {
      totalServicios,
      publicados,
      borradores: totalServicios - publicados,
      categorias: (await this.getCategorias()).length,
    };
  }

  async findOne(id: number) {
    const s = await this.prisma.servicio.findUnique({
      where: { id_servicio: id },
      include: {
        publica: {
          include: {
            entidad_prestadora: { include: { opera: true } }
          }
        }
      }
    });
    return s ? this.mapServicio(s) : null;
  }

  solicitar(id: number) {
    return { mensaje: 'Solicitud enviada exitosamente' };
  }

  update(id: number, updateDto: any) {
    return this.prisma.servicio.update({
      where: { id_servicio: id },
      data: {
        nombre_servicio: updateDto.nombre,
        descripcion: updateDto.descripcion,
        costo: updateDto.precio_base,
      },
    });
  }

  remove(id: number) {
    return this.prisma.servicio.delete({ where: { id_servicio: id } });
  }
}
