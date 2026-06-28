export class CreateEstudianteDto {
  id_miembro: number;
  promedio?: number;
  uc_aprobadas?: number;
  semestre_actual: number;
  escuela: string;
  facultad: string;
  tipo_beca?: string;
}
