import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('miembros/count')
  async getMiembrosCount() {
    const count = await this.prisma.miembro.count();
    return { count };
  }

  @Get('servicios/count')
  async getServiciosCount() {
    const count = await this.prisma.servicio.count();
    return { count };
  }

  @Get('pagos/pendientes/count')
  async getPagosPendientesCount() {
    // Assuming you have some paginacion logic or just fake it for now
    // if there is no explicit 'estado' in a 'pago' table
    return { count: 0 };
  }

  @Get('solicitudes/activas/count')
  async getSolicitudesActivasCount() {
    const count = await this.prisma.solicitud_servicio.count({
      where: { estado: 'activa' } // adjust state string if needed
    });
    return { count };
  }

  @Get('notificaciones/no-leidas/count')
  async getNotificacionesCount() {
    return { count: 0 };
  }

  @Get('actividad')
  async getActividad(@Query('limit') limit: string) {
    // Return empty array to suppress error, dashboard mock handles the rest if needed,
    // or just return mock so frontend gets proper data format
    return [];
  }
}
