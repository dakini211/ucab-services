export class CreateFolioDto {
  id_miembro: number;
  id_servicio: number;
  fecha_de_creacion: string;
  nro_de_folio: string;
  estado: string;
  fecha_inicio_mes: string;
  fecha_fin_mes?: string;
}
