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
   * Crea una Solicitud_Servicio + Folio + Item de consumo base en una sola
   * transacción. El ítem se carga con precio_unitario = NULL para que el
   * trigger trg_congelar_precio_item congele la tarifa vigente desde
   * Historico_Tarifa (regla pág. 4: "precio unitario tomado del historial
   * de tarifas en la fecha exacta del cargo").
   */
  async solicitar(idServicio: number, idMiembro: number) {
    const ahora = new Date();
    const nroFolio = `FOL-${ahora.getTime()}`;

    try {
      const [solicitud, folio] = await this.prisma.$transaction(async (tx) => {
        // 1. Crear la solicitud
        const s = await tx.solicitud_servicio.create({
          data: {
            id_miembro: BigInt(idMiembro),
            id_servicio: idServicio,
            fecha_de_creacion: ahora,
            estado: 'aprobada',
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
            fecha_inicio_mes: ahora,
          },
        });

        // 3. Cargar el ítem de consumo base (cargo del servicio)
        //    precio_unitario = NULL → el trigger trg_congelar_precio_item
        //    lo congela desde fn_tarifa_vigente(id_servicio, fecha_de_creacion)
        const servicioInfo = await tx.servicio.findUnique({
          where: { id_servicio: idServicio },
          select: { nombre_servicio: true },
        });

        await tx.$executeRaw`
          CALL sp_agregar_item_consumo(
            p_id_miembro        => ${BigInt(idMiembro)},
            p_id_servicio       => ${idServicio},
            p_fecha_de_creacion => ${ahora}::timestamp,
            p_nro_de_folio      => ${nroFolio},
            p_concepto          => ${servicioInfo?.nombre_servicio ?? 'Servicio solicitado'},
            p_cantidad          => 1,
            p_impuesto_ley      => 16.00,
            p_precio_unitario   => ${null}::numeric
          )
        `;

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
        HttpStatus.INTERNAL_SERVER_ERROR,
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
