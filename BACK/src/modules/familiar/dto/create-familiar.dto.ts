import { IsString, IsNotEmpty, IsInt, MaxLength, Min, Max, IsOptional } from 'class-validator';

export class CreateFamiliarDto {
  @IsInt({ message: 'La cédula debe ser un número' })
  @IsNotEmpty({ message: 'La cédula es requerida' })
  cedula: number;

  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del familiar es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre_familiar: string;

  @IsString({ message: 'El parentesco debe ser texto' })
  @IsNotEmpty({ message: 'El parentesco es requerido' })
  @MaxLength(50, { message: 'El parentesco no puede exceder 50 caracteres' })
  parentesco: string;

  @IsInt({ message: 'La edad debe ser un número' })
  @IsNotEmpty({ message: 'La edad es requerida' })
  @Min(0, { message: 'La edad no puede ser menor a 0' })
  @Max(130, { message: 'La edad parece incorrecta' })
  edad_familiar: number;

  @IsOptional()
  @IsString({ message: 'Estudios debe ser texto' })
  estudios?: string;

  @IsOptional()
  @IsString({ message: 'Vacunación debe ser texto' })
  vacunacion?: string;

  @IsOptional()
  @IsString({ message: 'Educación inicial debe ser texto' })
  educacion_inicial?: string;
}
