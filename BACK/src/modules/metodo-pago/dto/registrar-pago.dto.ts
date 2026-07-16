import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export type TipoPago =
  | 'zelle'
  | 'tarjeta'
  | 'pago_movil'
  | 'efectivo'
  | 'cripto'
  | 'tai';

export const TIPOS_PAGO: TipoPago[] = [
  'zelle',
  'tarjeta',
  'pago_movil',
  'efectivo',
  'cripto',
  'tai',
];

/**
 * DTO para registrar un abono contra una factura.
 *
 * IMPORTANTE - POR QUE CADA CAMPO LLEVA DECORADOR:
 * main.ts activa ValidationPipe({ whitelist: true }). Esa opcion BORRA del body
 * cualquier propiedad que no tenga al menos un decorador de validacion. Un DTO
 * declarado como `export class RegistrarPagoDto {}` (sin decoradores) haria que
 * el body llegue vacio al controlador, y el error resultante ("Falta el numero
 * de control") apuntaria al lugar equivocado.
 *
 * Tambien es la razon por la que esto es una CLASS y no una INTERFACE: con
 * emitDecoratorMetadata, @Body() necesita una referencia que exista en tiempo
 * de ejecucion, y las interfaces se borran al compilar a JavaScript.
 *
 * La validacion de aqui es solo de FORMATO. Las reglas de negocio (que la
 * factura exista, que no este pagada, que el saldo cuadre) las valida
 * PL/pgSQL: sp_registrar_pago y trg_actualizar_saldo_factura.
 */
export class RegistrarPagoDto {
  @IsString()
  @IsNotEmpty({ message: 'El número de control de la factura es requerido' })
  numero_de_control: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser numérico' })
  @IsPositive({ message: 'El monto del abono debe ser mayor a cero' })
  monto: number;

  @IsIn(TIPOS_PAGO, {
    message: `El método de pago debe ser uno de: ${TIPOS_PAGO.join(', ')}`,
  })
  tipo: TipoPago;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de operación no es una fecha válida' })
  fecha_operacion?: string | null;

  // ── Zelle ──────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  correo?: string | null;

  @IsOptional()
  @IsString()
  nombre?: string | null;

  @IsOptional()
  @IsString()
  confirmacion?: string | null;

  // ── Tarjeta ────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  nro_tarjeta?: string | null;

  @IsOptional()
  @IsString()
  vencimiento?: string | null;

  @IsOptional()
  @IsString()
  compania?: string | null;

  /** Compartido por Tarjeta (Nacional/Internacional) y Criptomoneda (TRC20/ERC20). */
  @IsOptional()
  @IsString()
  red?: string | null;

  // ── Pago Móvil ─────────────────────────────────────────────
  @IsOptional()
  @IsString()
  telefono_emisor?: string | null;

  @IsOptional()
  @IsString()
  banco?: string | null;

  @IsOptional()
  @IsString()
  referencia?: string | null;

  // ── Efectivo / Criptomoneda ────────────────────────────────
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La tasa debe ser numérica' })
  @IsPositive({ message: 'La tasa debe ser mayor a cero' })
  tasa?: number | null;

  // ── Criptomoneda ───────────────────────────────────────────
  @IsOptional()
  @IsString()
  dxid?: string | null;

  @IsOptional()
  @IsString()
  billetera?: string | null;

  // ── TAI (billetera digital) ────────────────────────────────
  @IsOptional()
  @IsString()
  uid?: string | null;

  @IsOptional()
  @IsString()
  pos?: string | null;
}
