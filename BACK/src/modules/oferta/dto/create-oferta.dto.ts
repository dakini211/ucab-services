import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * ValidationPipe global usa whitelist: true, así que cada campo necesita un
 * decorador o el body llega vacío al controlador.
 * id_miembro NO viaja en el body: se toma de req.user (JWT) para que un
 * estudiante no pueda postularse en nombre de otro miembro.
 */
export class CreateOfertaDto {
  @IsString()
  @IsNotEmpty({ message: 'nombre_entidad es requerido' })
  @MaxLength(150)
  nombre_entidad: string;

  @IsString()
  @IsNotEmpty({ message: 'cargo es requerido' })
  @MaxLength(100)
  cargo: string;
}
