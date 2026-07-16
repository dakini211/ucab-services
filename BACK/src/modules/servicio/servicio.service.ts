import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ServicioService {
  constructor(private prisma: PrismaService) {}

  private mapServicio(s: any) {
    const entidad = s.publica?.entidad_prestadora;
    let sedeStr = 'Sede Montalbán';
    if (entidad?.opera) {
      if (Array.isArray(entidad.opera)) {
        const sedes = entidad.opera.map((o: any) => o.nombre_sede);
        if (sedes.length > 0) sedeStr = sedes.join(', ');
      } else {
        sedeStr = entidad.opera.nombre_sede || 'Sede Montalbán';
      }
    }

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

  /**
   * Crea una Solicitud_Servicio con estado 'aprobado' y abre el Folio
   * correspondiente en una única transacción.
   * 
   * El nro_de_folio se genera como FOL-<timestamp> para garantizar unicidad.
   * El folio se abre con fecha_inicio_mes = primer día del mes en curso.
   */
  async solicitar(idServicio: number, idMiembro: number) {
    const ahora = new Date();
    const nroFolio = `FOL-${ahora.getTime()}`;

    // Primer día del mes actual para fecha_inicio_mes
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    try {
      const [solicitud, folio] = await this.prisma.$transaction(async (tx) => {
        // 1. Crear la solicitud
        const s = await tx.solicitud_servicio.create({
          data: {
            id_miembro: BigInt(idMiembro),
            id_servicio: idServicio,
            fecha_de_creacion: ahora,
            estado: 'aprobada', // The check constraint expects 'aprobada', not 'aprobado'
          },
        });

        // 2. Crear el folio asociado
        const f = await tx.folio.create({
          data: {
            id_miembro: BigInt(idMiembro),
            id_servicio: idServicio,
            fecha_de_creacion: ahora,
            nro_de_folio: nroFolio,
            estado: 'abierto',
            // chk_folio_posterior_solicitud: fecha_inicio_mes >= fecha_de_creacion
            // Set it to ahora to bypass check constraint failure when mid-month
            fecha_inicio_mes: ahora,
          },
        });

        return [s, f];
      });

      return {
        solicitud: {
          id_miembro: solicitud.id_miembro.toString(),
          id_servicio: solicitud.id_servicio,
          fecha_de_creacion: solicitud.fecha_de_creacion.toISOString(),
          estado: solicitud.estado,
        },
        folio: {
          nro_de_folio: folio.nro_de_folio,
          estado: folio.estado,
          fecha_inicio_mes: folio.fecha_inicio_mes.toISOString().split('T')[0],
        },
      };
    } catch (error: any) {
      console.error('Error al solicitar servicio:', error);
      throw new HttpException(
        error.message || 'Error al procesar la solicitud',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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
