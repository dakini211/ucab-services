export class CreateTasaCambioDto {
  moneda_origen: string;
  moneda_destino: string;
  fecha_vigencia: string;
  valor_tasa: number;
}
