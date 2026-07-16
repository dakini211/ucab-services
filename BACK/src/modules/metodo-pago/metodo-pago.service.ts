import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type TipoPago =
  | 'zelle'
  | 'tarjeta'
  | 'pago_movil'
  | 'efectivo'
  | 'cripto'
  | 'tai';

export class RegistrarPagoDto {
  numero_de_control: string;
  monto: number;
  tipo: TipoPago;
  fecha_operacion?: string | null;
  // Zelle
  correo?: string | null;
  nombre?: string | null;
  confirmacion?: string | null;
  // Tarjeta
  nro_tarjeta?: string | null;
  vencimiento?: string | null;
  compania?: string | null;
  red?: string | null;
  // Pago Movil
  telefono_emisor?: string | null;
  banco?: string | null;
  referencia?: string | null;
  // Efectivo / Cripto
  tasa?: number | null;
  // Cripto
  dxid?: string | null;
  billetera?: string | null;
  // TAI
  uid?: string | null;
  pos?: string | null;
}

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
 */
@Injectable()
export class MetodoPagoService {
  constructor(private prisma: PrismaService) {}

  private static readonly TIPOS: TipoPago[] = [
    'zelle',
    'tarjeta',
    'pago_movil',
    'efectivo',
    'cripto',
    'tai',
  ];

  async registrar(dto: RegistrarPagoDto) {
    if (!dto.numero_de_control) {
      throw new BadRequestException('Falta el numero de control de la factura.');
    }
    if (!dto.monto || Number(dto.monto) <= 0) {
      throw new BadRequestException('El monto del abono debe ser mayor a cero.');
    }
    if (!MetodoPagoService.TIPOS.includes(dto.tipo)) {
      throw new BadRequestException(
        `Tipo de pago no valido: "${dto.tipo}". Use: ${MetodoPagoService.TIPOS.join(', ')}.`,
      );
    }

    const fecha = dto.fecha_operacion ? new Date(dto.fecha_operacion) : new Date();

    await this.prisma.$executeRaw`
      CALL sp_registrar_pago(
        p_numero_de_control => ${dto.numero_de_control},
        p_monto             => ${Number(dto.monto)}::numeric,
        p_tipo              => ${dto.tipo},
        p_fecha_operacion   => ${fecha}::timestamp,
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
          ? 'Abono registrado. La factura quedo pagada.'
          : `Abono registrado. Saldo pendiente: ${factura ? Number(factura.saldo).toFixed(2) : '?'}.`,
    };
  }

  /** Abonos de una factura, con el tipo real resuelto desde las subclases. */
  async findByFactura(numero_de_control: string) {
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
