export class CreateServicioDto {
  id_servicio: number;
  nombre_servicio: string;
  descripcion?: string | null;
  costo: number;
}
