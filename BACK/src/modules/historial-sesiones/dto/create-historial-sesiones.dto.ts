export class CreateHistorialSesionesDto {
  id_miembro: number;
  lugar_conexion: string;
  direccion_ip: string;
  fecha_inicio: string;
  hora_inicio?: string;
  hora_fin?: string;
}
