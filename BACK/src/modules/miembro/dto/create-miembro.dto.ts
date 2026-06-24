export class CreateMiembroDto {
  cedula_identidad: number;
  primer_nombre: string;
  segundo_nombre?: string; // El signo '?' significa que es opcional
  primer_apellido: string;
  segundo_apellido?: string;
  fecha_nacimiento: string; // Recibiremos la fecha como un string 'YYYY-MM-DD' desde Angular
  telefono: string;
  correo_institucional: string;
  direccion_habitacion: string;
}
