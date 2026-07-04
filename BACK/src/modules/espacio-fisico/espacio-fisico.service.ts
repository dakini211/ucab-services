import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EspacioFisicoService {
  constructor(private prisma: PrismaService) {}

  create(createDto: any) {
    return this.prisma.espacio_fisico.create({ data: createDto });
  }

  async findAll() {
    const espacios = await this.prisma.espacio_fisico.findMany({
      orderBy: [{ nombre_edificacion: 'asc' }, { nro: 'asc' }],
      include: { edificacion: true }
    });

    const data = espacios.map((e, index) => ({
      id: index + 1,
      numero: e.nro.toString(),
      edificacion: e.nombre_edificacion,
      tipo_espacio: e.tipo_inmobiliario,
      capacidad: e.capacidad_maxima_aforo,
      disponibilidad: 'Disponible',
      sede: e.edificacion?.nombre_sede || 'Desconocida',
      descripcion: e.direccion_interna,
      recursos_tecnologicos: []
    }));

    return {
      data,
      total: data.length,
      totalPages: 1,
      page: 1
    };
  }

  /** Obtiene el espacio real de la BD a partir del id ficticio (posición en el ordenamiento) */
  private async getEspacioByFicticioId(id: number) {
    const espacios = await this.prisma.espacio_fisico.findMany({
      orderBy: [{ nombre_edificacion: 'asc' }, { nro: 'asc' }]
    });
    const index = id - 1;
    if (index < 0 || index >= espacios.length) return null;
    return espacios[index];
  }

  async getSedes() {
    const sedes = await this.prisma.sede.findMany({ select: { nombre_sede: true } });
    return sedes.map(s => s.nombre_sede);
  }

  async getEdificaciones() {
    const edi = await this.prisma.edificacion.findMany({ select: { nombre_edificacion: true } });
    return edi.map(e => e.nombre_edificacion);
  }

  async getTipos() {
    const esp = await this.prisma.espacio_fisico.findMany({
      select: { tipo_inmobiliario: true },
      distinct: ['tipo_inmobiliario']
    });
    return esp.map(e => e.tipo_inmobiliario);
  }

  async reservar(id: number, payload: any) {
    const espacio = await this.getEspacioByFicticioId(id);
    if (!espacio) throw new Error(`Espacio con id ${id} no encontrado.`);

    const miembro = await this.prisma.miembro.findFirst({
      where: { estado_cuenta: 'activa' }
    });
    if (!miembro) throw new Error('No hay miembros activos en la base de datos.');
    const p_id_miembro = Number(miembro.id_miembro);

    const servicio = await this.prisma.servicio.findFirst();
    if (!servicio) throw new Error('No hay servicios en la base de datos.');
    const p_id_servicio = servicio.id_servicio;

    const fInicio = new Date(payload.fecha_inicio);
    const fFin = new Date(payload.fecha_fin);

    const fecha_reserva_str = fInicio.toISOString().split('T')[0];
    const hora_inicio_str   = fInicio.toTimeString().slice(0, 8);
    const hora_fin_str      = fFin.toTimeString().slice(0, 8);

    // Escapar comillas simples en los strings para evitar SQL injection
    const nombreEscapado    = espacio.nombre_edificacion.replace(/'/g, "''");
    const direccionEscapada = espacio.direccion_interna.replace(/'/g, "''");

    await this.prisma.$executeRawUnsafe(`
      CALL sp_reservar_espacio(
        ${p_id_miembro},
        ${p_id_servicio},
        ${espacio.nro},
        '${nombreEscapado}',
        '${direccionEscapada}',
        '${fecha_reserva_str}'::date,
        '${hora_inicio_str}'::time,
        '${hora_fin_str}'::time
      )
    `);

    return {
      mensaje: 'Reserva confirmada exitosamente',
      espacio: espacio.nombre_edificacion,
      nro: espacio.nro,
      fecha: fecha_reserva_str,
      hora_inicio: hora_inicio_str,
      hora_fin: hora_fin_str,
      miembro: `${miembro.primer_nombre} ${miembro.primer_apellido}`
    };
  }

  async getReservas(id: number, mes?: string, anio?: string) {
    const espacio = await this.getEspacioByFicticioId(id);
    if (!espacio) return [];

    const historial = await this.prisma.historial_reservas.findMany({
      where: {
        nro: espacio.nro,
        nombre_edificacion: espacio.nombre_edificacion,
        direccion_interna: espacio.direccion_interna
      }
    });

    return historial.map(h => {
      const fecha = h.fecha_reserva instanceof Date
        ? h.fecha_reserva.toISOString().split('T')[0]
        : String(h.fecha_reserva).split('T')[0];

      const toHHMMSS = (val: any): string => {
        if (val instanceof Date) {
          const hh = val.getUTCHours().toString().padStart(2, '0');
          const mm = val.getUTCMinutes().toString().padStart(2, '0');
          return `${hh}:${mm}:00`;
        }
        const s = String(val);
        return s.includes('T') ? s.split('T')[1].slice(0, 8) : s.slice(0, 8);
      };

      return {
        id: h.id_servicio,
        titulo: 'Reservado',
        organizacion: h.nombre_edificacion,
        fecha_inicio: `${fecha}T${toHHMMSS(h.hora_inicio)}`,
        fecha_fin:    `${fecha}T${toHHMMSS(h.hora_fin)}`,
        color: '#E63946'
      };
    });
  }

  findOne(id: any) {
    return this.getEspacioByFicticioId(+id);
  }

  update(id: any, updateDto: any) {
    return null;
  }

  remove(id: any) {
    return null;
  }
}
