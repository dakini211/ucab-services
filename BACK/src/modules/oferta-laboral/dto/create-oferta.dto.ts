import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para postularse a una oferta laboral.
 *
 * POR QUE CADA CAMPO LLEVA DECORADOR:
 * main.ts activa ValidationPipe({ whitelist: true }), que BORRA del body toda
 * propiedad sin decorador de validación. Un DTO vacío haría que el body llegue
 * vacío al controlador y el procedimiento recibiría NULL.
 *
 * Y es una CLASS, no una interface: con emitDecoratorMetadata, @Body() necesita
 * una referencia que exista en tiempo de ejecución.
 *
 * Aquí solo se valida el FORMATO. Las reglas de negocio (mayoría de edad,
 * cuenta activa, vacante disponible, no duplicar) viven en
 * sp_aplicar_oferta_laboral.
 *
 * (nombre_entidad, cargo) es la clave natural de Oferta_laboral.
 */
export class CreateOfertaDto {
  @IsString()
  @IsNotEmpty({ message: 'La entidad que publica la oferta es requerida' })
  nombre_entidad: string;

  @IsString()
  @IsNotEmpty({ message: 'El cargo es requerido' })
  cargo: string;
}
