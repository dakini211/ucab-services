export class CreateFacturaDto {
  numero_de_control: string;
  fecha_de_emision?: Date;
  estatus: string;
  id_miembro: bigint;
  id_servicio: number;
  fecha_de_creacion: Date;
  nro_de_folio: string;
}
