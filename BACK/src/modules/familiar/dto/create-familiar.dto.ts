export class CreateFamiliarDto {
  cedula: number;
  id_personal_ucab: bigint;
  nombre_familiar: string;
  parentesco: string;
  edad_familiar: number;
  fecha_de_inicio: Date;
  fecha_de_fin?: Date | null;
}
