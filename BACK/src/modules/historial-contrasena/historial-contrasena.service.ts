import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HistorialContrasenaService {
  constructor(private prisma: PrismaService) {}

  create(createDto: any) {
    return this.prisma.historial_contrasena.create({ data: createDto });
  }

  findAll() {
    return this.prisma.historial_contrasena.findMany();
  }

  findOne(id: any) {
    // TODO: Ajustar si la tabla usa llave primaria compuesta o si el ID no es número
    return this.prisma.historial_contrasena.findUnique({ where: { id_miembro: BigInt(id) } as any });
  }

  update(id: any, updateDto: any) {
    return this.prisma.historial_contrasena.update({
      where: { id_miembro: BigInt(id) } as any,
      data: updateDto,
    });
  }

  remove(id: any) {
    return this.prisma.historial_contrasena.delete({ where: { id_miembro: BigInt(id) } as any });
  }

  /**
   * Llama al stored procedure sp_cambiar_contrasena(p_id_miembro, p_nueva_contrasena)
   * que cierra la contraseña activa e inserta la nueva en el historial.
   */
  async cambiarContrasena(idMiembro: number, nuevaContrasena: string): Promise<{ message: string }> {
    if (!nuevaContrasena || nuevaContrasena.trim().length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres.');
    }
    await this.prisma.$executeRaw`CALL sp_cambiar_contrasena(${BigInt(idMiembro)}, ${nuevaContrasena})`;
    return { message: 'Contraseña actualizada con éxito.' };
  }
}
