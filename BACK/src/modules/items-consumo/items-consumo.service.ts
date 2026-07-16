import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Items de consumo: lineas de cargo de un folio (pag. 4).
 *
 * EL PRECIO NO SE ENVIA DESDE AQUI (normalmente).
 * Si precio_unitario llega null, el trigger trg_congelar_precio_item lo busca
 * en Historico_Tarifa y lo congela a la fecha del cargo. Esa es la regla de la
 * pag. 4: "el precio unitario tomado del historial de tarifas en la fecha
 * exacta del cargo". El backend no elige precios.
 *
 * Si se envia un precio explicito, se respeta: son los conceptos suplementarios
 * (materiales, certificados) que no tienen tarifa propia, porque
 * Historico_Tarifa es por SERVICIO, no por concepto.
 */
@Injectable()
export class ItemsConsumoService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    id_miembro: string | number;
    id_servicio: number;
    fecha_de_creacion: string;
    nro_de_folio: string;
    concepto: string;
    cantidad: number;
    impuesto_ley?: number | null;
    precio_unitario?: number | null;
  }) {
    await this.prisma.$executeRaw`
      CALL sp_agregar_item_consumo(
        p_id_miembro        => ${BigInt(dto.id_miembro)},
        p_id_servicio       => ${Number(dto.id_servicio)},
        p_fecha_de_creacion => ${new Date(dto.fecha_de_creacion)}::timestamp,
        p_nro_de_folio      => ${dto.nro_de_folio},
        p_concepto          => ${dto.concepto},
        p_cantidad          => ${Number(dto.cantidad)},
        p_impuesto_ley      => COALESCE(${dto.impuesto_ley ?? null}::numeric, 16.00),
        p_precio_unitario   => ${dto.precio_unitario ?? null}::numeric
      )
    `;

    return { ok: true, mensaje: `Item "${dto.concepto}" cargado al folio ${dto.nro_de_folio}.` };
  }

  /** Items de un folio (clave compuesta de 4 columnas). */
  async findByFolio(key: {
    id_miembro: string | number;
    id_servicio: number;
    fecha_de_creacion: string;
    nro_de_folio: string;
  }) {
    return this.prisma.$queryRaw<any[]>`
      SELECT
        ic.concepto,
        ic.cantidad,
        ic.impuesto_ley::float8    AS impuesto_ley,
        ic.precio_unitario::float8 AS precio_unitario,
        ROUND(ic.cantidad * ic.precio_unitario * (1 + ic.impuesto_ley / 100), 2)::float8 AS total_linea
      FROM Items_Consumo ic
      WHERE ic.id_miembro        = ${BigInt(key.id_miembro)}
        AND ic.id_servicio       = ${Number(key.id_servicio)}
        AND ic.fecha_de_creacion = ${new Date(key.fecha_de_creacion)}::timestamp
        AND ic.nro_de_folio      = ${key.nro_de_folio}
      ORDER BY ic.concepto
    `;
  }

  /**
   * Elimina una linea de cargo.
   * Si el folio ya fue facturado, trg_bloquear_folio_facturado lo rechaza y el
   * PrismaExceptionFilter convierte ese error en un 400 con mensaje legible.
   */
  async remove(key: {
    id_miembro: string | number;
    id_servicio: number;
    fecha_de_creacion: string;
    nro_de_folio: string;
    concepto: string;
  }) {
    await this.prisma.items_consumo.delete({
      where: {
        id_miembro_id_servicio_fecha_de_creacion_nro_de_folio_concepto: {
          id_miembro: BigInt(key.id_miembro),
          id_servicio: Number(key.id_servicio),
          fecha_de_creacion: new Date(key.fecha_de_creacion),
          nro_de_folio: key.nro_de_folio,
          concepto: key.concepto,
        },
      },
    });
    return { ok: true };
  }
}
