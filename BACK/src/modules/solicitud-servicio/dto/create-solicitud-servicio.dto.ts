export class CreateSolicitudServicioDto {
  id_miembro: number;
  id_servicio: number;
  fecha_de_creacion: string;
  estado: string;
  resolucion?: string;
}
