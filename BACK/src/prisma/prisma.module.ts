import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 🔥 Esto hace que Prisma esté disponible en TODO el backend automáticamente
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exportamos el servicio para que otros lo usen
})
export class PrismaModule {}