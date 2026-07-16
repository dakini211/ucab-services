import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * Traduce los errores de PostgreSQL a respuestas HTTP legibles.
 *
 * POR QUE HACE FALTA:
 * La logica de negocio del modulo financiero vive en la base de datos (triggers
 * y procedimientos), asi que los errores tambien nacen ahi. Pero cuando se llama
 * un procedimiento con $executeRaw, Prisma ENVUELVE el error de PostgreSQL:
 * llega como PrismaClientKnownRequestError con code 'P2010' (raw query failed),
 * y el SQLSTATE real queda escondido en e.meta.code.
 *
 * Sin este filtro, todos los RAISE EXCEPTION que escribimos en PL/pgSQL
 * ("La factura ya esta pagada: no admite abonos adicionales") llegarian al
 * usuario como un 500 generico. Este filtro los desempaqueta.
 */
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  /** SQLSTATE de PostgreSQL -> status HTTP */
  private static readonly SQLSTATE_HTTP: Record<string, number> = {
    P0001: HttpStatus.BAD_REQUEST, // RAISE EXCEPTION de nuestros procedimientos
    '23505': HttpStatus.CONFLICT, // unique_violation
    '23503': HttpStatus.BAD_REQUEST, // foreign_key_violation
    '23514': HttpStatus.BAD_REQUEST, // check_violation
    '23502': HttpStatus.BAD_REQUEST, // not_null_violation
    '22003': HttpStatus.BAD_REQUEST, // numeric_value_out_of_range
    '22P02': HttpStatus.BAD_REQUEST, // invalid_text_representation
  };

  /**
   * Un CHECK violado devuelve el nombre de la restriccion, no una explicacion.
   * Aqui se traduce a algo que el cajero pueda leer.
   */
  private static readonly MENSAJES_RESTRICCION: Record<string, string> = {
    uq_factura_folio:
      'Ese folio ya tiene una factura emitida. Un folio se convierte en una sola factura.',
    chk_saldo_vs_estatus: 'El saldo no concuerda con el estatus de la factura.',
    chk_saldo_factura: 'El saldo de la factura no puede quedar negativo.',
    chk_estatus_factura: 'El estatus de la factura no es valido.',
    chk_estado_folio: 'El estado del folio no es valido.',
    chk_estado_solicitud: 'El estado de la solicitud no es valido.',
    chk_fechas_folio:
      'La fecha de cierre del folio no puede ser anterior a su fecha de inicio.',
    chk_folio_posterior_solicitud:
      'El folio no puede iniciar antes de la solicitud que lo origina.',
    chk_fecha_emision_factura: 'La factura no puede emitirse antes de la solicitud.',
    chk_cantidad_items: 'La cantidad del item debe ser mayor a cero.',
    chk_precio_unitario_items: 'El precio unitario no puede ser negativo.',
    chk_impuesto_ley_items: 'El impuesto de ley no puede ser negativo.',
    chk_monto_metodo_pago: 'El monto del abono debe ser mayor a cero.',
    chk_saldo_positivo:
      'La billetera digital no tiene saldo suficiente para este pago.',
    pk_metodo_pago:
      'Ya existe un pago registrado para esa factura en esa misma fecha y hora.',
    pk_items_consumo:
      'Ese concepto ya fue cargado en este folio. Usa un concepto distinto.',
  };

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensaje = 'Ocurrio un error inesperado procesando la solicitud.';
    let sqlstate: string | null = null;
    let restriccion: string | null = null;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // P2010 = raw query failed. El error real de PostgreSQL viene en meta.
      if (exception.code === 'P2010') {
        const meta: any = exception.meta ?? {};
        sqlstate = meta.code ?? null;
        const detalle: string = meta.message ?? exception.message;

        status =
          PrismaExceptionFilter.SQLSTATE_HTTP[sqlstate ?? ''] ??
          HttpStatus.BAD_REQUEST;

        restriccion = this.extraerRestriccion(detalle);

        if (restriccion && PrismaExceptionFilter.MENSAJES_RESTRICCION[restriccion]) {
          mensaje = PrismaExceptionFilter.MENSAJES_RESTRICCION[restriccion];
        } else {
          // Los RAISE EXCEPTION de PL/pgSQL ya traen un mensaje redactado.
          mensaje = this.limpiarMensaje(detalle);
        }
      } else if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        mensaje = 'Ya existe un registro con esos datos unicos.';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        mensaje = 'No se encontro el registro solicitado.';
      } else if (exception.code === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        mensaje = 'El registro referenciado no existe.';
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      mensaje = 'Los datos enviados no tienen el formato esperado.';
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception?.message, exception?.stack);
    }

    response.status(status).json({
      statusCode: status,
      error: mensaje,
      sqlstate,
      restriccion,
    });
  }

  /** Saca el nombre de la restriccion del texto crudo de PostgreSQL. */
  private extraerRestriccion(detalle: string): string | null {
    const m = /"([a-z0-9_]+)"/i.exec(detalle ?? '');
    return m ? m[1] : null;
  }

  /**
   * PostgreSQL antepone ruido tecnico al mensaje. Nos quedamos con la parte
   * util, que es la que escribimos en el RAISE EXCEPTION.
   */
  private limpiarMensaje(detalle: string): string {
    if (!detalle) return 'Error al ejecutar la operacion en la base de datos.';
    return detalle
      .replace(/^ERROR:\s*/i, '')
      .replace(/\s*CONTEXT:[\s\S]*$/i, '')
      .trim();
  }
}
