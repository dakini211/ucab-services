import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';

// Se reexportan para no romper imports existentes que apuntaban al service.
export { RegistrarPagoDto, TIPOS_PAGO } from './dto/registrar-pago.dto';
export type { TipoPago } from './dto/registrar-pago.dto';

/**
 * Metodos de pago y abonos.
 *
 * EL SALDO NO SE CALCULA AQUI.
 * sp_registrar_pago inserta el pago; el trigger trg_actualizar_saldo_factura
 * recalcula el saldo y cambia el estatus a 'parcial' o 'pagada'. Esa es la
 * regla textual de la pag. 6 del enunciado, y vive en la base de datos:
 * si alguien inserta un pago por fuera de esta API, el saldo se actualiza igual.
 *
 * Este servicio no resta ni un centavo.
 *
 * VALIDACION EN DOS CAPAS:
 *   - Formato (obligatorios, tipos, rangos)  -> decoradores de RegistrarPagoDto
 *   - Reglas de negocio (factura inexistente, ya pagada, anulada, billetera sin
 *     saldo)                                 -> PL/pgSQL, traducido por PrismaExceptionFilter
 * Por eso aqui ya no hay ifs de validacion: eran redundantes con el DTO.
 */
@Injectable()
export class MetodoPagoService {
  constructor(private prisma: PrismaService) { }

  async registrar(user: any, dto: RegistrarPagoDto) {
    if (user.rol === 'Admin' || user.rol === 'Administrativo') {
      throw new ForbiddenException('Los administradores no pueden registrar pagos.');
    }

    const checkFactura = await this.prisma.factura.findUnique({
      where: { numero_de_control: dto.numero_de_control },
    });
    if (!checkFactura) throw new NotFoundException('Factura no encontrada.');
    if (Number(checkFactura.id_miembro) !== user.id) {
      throw new ForbiddenException('No puedes abonar a una factura que no te pertenece.');
    }

    const fecha = dto.fecha_operacion ? new Date(dto.fecha_operacion) : new Date();

    await this.prisma.$executeRaw`
      CALL sp_registrar_pago(
        p_numero_de_control => ${dto.numero_de_control},
        p_monto             => ${Number(dto.monto)}::numeric,
        p_tipo              => ${dto.tipo},
        p_fecha_operacion   => ${fecha},
        p_correo            => ${dto.correo ?? null}::varchar,
        p_nombre            => ${dto.nombre ?? null}::varchar,
        p_confirmacion      => ${dto.confirmacion ?? null}::varchar,
        p_nro_tarjeta       => ${dto.nro_tarjeta ?? null}::varchar,
        p_vencimiento       => ${dto.vencimiento ?? null}::varchar,
        p_compania          => ${dto.compania ?? null}::varchar,
        p_red               => ${dto.red ?? null}::varchar,
        p_telefono_emisor   => ${dto.telefono_emisor ?? null}::varchar,
        p_banco             => ${dto.banco ?? null}::varchar,
        p_referencia        => ${dto.referencia ?? null}::varchar,
        p_tasa              => COALESCE(${dto.tasa ?? null}::numeric, 1.0),
        p_dxid              => ${dto.dxid ?? null}::varchar,
        p_billetera         => ${dto.billetera ?? null}::varchar,
        p_uid               => ${dto.uid ?? null}::varchar,
        p_pos               => ${dto.pos ?? null}::varchar
      )
    `;

    // Se relee la factura para devolver el saldo y el estatus que decidio el trigger.
    const factura = await this.prisma.factura.findUnique({
      where: { numero_de_control: dto.numero_de_control },
      select: { numero_de_control: true, estatus: true, saldo: true },
    });

    return {
      numero_de_control: factura?.numero_de_control,
      estatus: factura?.estatus,
      saldo: factura ? Number(factura.saldo) : null,
      mensaje:
        factura?.estatus === 'pagada'
          ? 'Abono registrado. La factura quedó pagada.'
          : `Abono registrado. Saldo pendiente: ${factura ? Number(factura.saldo).toFixed(2) : '?'}.`,
    };
  }

  /** Abonos de una factura, con el tipo real resuelto desde las subclases. */
  async findByFactura(user: any, numero_de_control: string) {
    const checkFactura = await this.prisma.factura.findUnique({
      where: { numero_de_control },
    });
    if (!checkFactura) throw new NotFoundException('Factura no encontrada.');
    if (user.rol !== 'Admin' && user.rol !== 'Administrativo' && Number(checkFactura.id_miembro) !== user.id) {
      throw new ForbiddenException('No tienes permiso para ver los pagos de esta factura.');
    }

    return this.prisma.$queryRaw<any[]>`
      SELECT
        mp.fecha_operacion,
        mp.monto::float8 AS monto,
        CASE
          WHEN z.numero_de_control   IS NOT NULL THEN 'Zelle'
          WHEN t.numero_de_control   IS NOT NULL THEN 'Tarjeta'
          WHEN pm.numero_de_control  IS NOT NULL THEN 'Pago Movil'
          WHEN e.numero_de_control   IS NOT NULL THEN 'Efectivo'
          WHEN c.numero_de_control   IS NOT NULL THEN 'Criptomoneda'
          WHEN tai.numero_de_control IS NOT NULL THEN 'TAI'
          ELSE 'Sin clasificar'
        END AS tipo,
        COALESCE(z.confirmacion, pm.referencia, c.dxid, t.nro_tarjeta, tai.uid) AS referencia
      FROM Metodo_Pago mp
      LEFT JOIN Zelle        z   ON z.numero_de_control   = mp.numero_de_control AND z.fecha_operacion   = mp.fecha_operacion
      LEFT JOIN Tarjeta      t   ON t.numero_de_control   = mp.numero_de_control AND t.fecha_operacion   = mp.fecha_operacion
      LEFT JOIN Pago_Movil   pm  ON pm.numero_de_control  = mp.numero_de_control AND pm.fecha_operacion  = mp.fecha_operacion
      LEFT JOIN Efectivo     e   ON e.numero_de_control   = mp.numero_de_control AND e.fecha_operacion   = mp.fecha_operacion
      LEFT JOIN Criptomoneda c   ON c.numero_de_control   = mp.numero_de_control AND c.fecha_operacion   = mp.fecha_operacion
      LEFT JOIN TAI          tai ON tai.numero_de_control = mp.numero_de_control AND tai.fecha_operacion = mp.fecha_operacion
      WHERE mp.numero_de_control = ${numero_de_control}
      ORDER BY mp.fecha_operacion
    `;
  }
}
