import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AcompananteModule } from './modules/acompanante/acompanante.module';
import { AdministrativoModule } from './modules/administrativo/administrativo.module';
import { BilleteraDigitalModule } from './modules/billetera-digital/billetera-digital.module';
import { CargoMayorModule } from './modules/cargo-mayor/cargo-mayor.module';
import { CargoMenorModule } from './modules/cargo-menor/cargo-menor.module';
import { CriptomonedaModule } from './modules/criptomoneda/criptomoneda.module';
import { EdificacionModule } from './modules/edificacion/edificacion.module';
import { EfectivoModule } from './modules/efectivo/efectivo.module';
import { EgresadoModule } from './modules/egresado/egresado.module';
import { EntidadPrestadoraModule } from './modules/entidad-prestadora/entidad-prestadora.module';
import { EntidadPropiaModule } from './modules/entidad-propia/entidad-propia.module';
import { EspacioFisicoModule } from './modules/espacio-fisico/espacio-fisico.module';
import { EstudianteModule } from './modules/estudiante/estudiante.module';
import { FacturaModule } from './modules/factura/factura.module';
import { FamiliarModule } from './modules/familiar/familiar.module';
import { FolioModule } from './modules/folio/folio.module';
import { HistorialContrasenaModule } from './modules/historial-contrasena/historial-contrasena.module';
import { HistorialMiembroModule } from './modules/historial-miembro/historial-miembro.module';
import { HistorialReservasModule } from './modules/historial-reservas/historial-reservas.module';
import { HistorialSesionesModule } from './modules/historial-sesiones/historial-sesiones.module';
import { HistoricoTarifaModule } from './modules/historico-tarifa/historico-tarifa.module';
import { ItemsConsumoModule } from './modules/items-consumo/items-consumo.module';
import { MetodoPagoModule } from './modules/metodo-pago/metodo-pago.module';
import { MiembroModule } from './modules/miembro/miembro.module';
import { ObtieneModule } from './modules/obtiene/obtiene.module';
import { OfertaModule } from './modules/oferta/oferta.module';
import { OfertaLaboralModule } from './modules/oferta-laboral/oferta-laboral.module';
import { OperaModule } from './modules/opera/opera.module';
import { OrganizacionExternaModule } from './modules/organizacion-externa/organizacion-externa.module';
import { PagoMovilModule } from './modules/pago-movil/pago-movil.module';
import { PersonalUcabModule } from './modules/personal-ucab/personal-ucab.module';
import { PreparadorModule } from './modules/preparador/preparador.module';
import { ProfesorModule } from './modules/profesor/profesor.module';
import { PublicaModule } from './modules/publica/publica.module';
import { RecursoTecnologicosModule } from './modules/recurso-tecnologicos/recurso-tecnologicos.module';
import { SedeModule } from './modules/sede/sede.module';
import { ServicioModule } from './modules/servicio/servicio.module';
import { SolicitudServicioModule } from './modules/solicitud-servicio/solicitud-servicio.module';
import { TaiModule } from './modules/tai/tai.module';
import { TarjetaModule } from './modules/tarjeta/tarjeta.module';
import { TasaCambioModule } from './modules/tasa-cambio/tasa-cambio.module';
import { ZelleModule } from './modules/zelle/zelle.module';
import { ReportesModule } from './modules/reportes/reportes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AcompananteModule, AdministrativoModule, BilleteraDigitalModule,
    CargoMayorModule, CargoMenorModule, CriptomonedaModule,
    EdificacionModule, EfectivoModule, EgresadoModule,
    EntidadPrestadoraModule, EntidadPropiaModule, EspacioFisicoModule,
    EstudianteModule, FacturaModule, FamiliarModule, FolioModule,
    HistorialContrasenaModule, HistorialMiembroModule, HistorialReservasModule,
    HistorialSesionesModule, HistoricoTarifaModule, ItemsConsumoModule,
    MetodoPagoModule, MiembroModule, ObtieneModule, OfertaModule,
    OfertaLaboralModule, OperaModule, OrganizacionExternaModule,
    PagoMovilModule, PersonalUcabModule, PreparadorModule, ProfesorModule,
    PublicaModule, RecursoTecnologicosModule, SedeModule, ServicioModule,
    SolicitudServicioModule, TaiModule, TarjetaModule, TasaCambioModule, ZelleModule,
    ReportesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
