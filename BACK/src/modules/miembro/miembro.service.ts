import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateMiembroDto } from './dto/create-miembro.dto';
import { UpdateMiembroDto } from './dto/update-miembro.dto';
import { PrismaService } from '../../prisma/prisma.service'; 

@Injectable()
export class MiembroService {
  constructor(private prisma: PrismaService) {}

  // 2. Método tipado estrictamente con CreateMiembroDto
  async create(createMiembroDto: CreateMiembroDto) { 
    try {
      const nuevoMiembro = await this.prisma.miembro.create({
        data: {
          cedula_identidad: Number(createMiembroDto.cedula_identidad),
          primer_nombre: createMiembroDto.primer_nombre,
          segundo_nombre: createMiembroDto.segundo_nombre || null,
          primer_apellido: createMiembroDto.primer_apellido,
          segundo_apellido: createMiembroDto.segundo_apellido || null,
          fecha_nacimiento: new Date(createMiembroDto.fecha_nacimiento),
          telefono: createMiembroDto.telefono,
          correo_institucional: createMiembroDto.correo_institucional,
          direccion_habitacion: createMiembroDto.direccion_habitacion,
          total_sesiones: 0,
          estado_cuenta: 'activa',
        },
      });

      return {
        success: true,
        message: '¡Miembro guardado en PostgreSQL!',
        data: nuevoMiembro
      };
    } catch (error) {
      // Tipamos el error para que TypeScript esté feliz
      throw new InternalServerErrorException('Error en la base de datos: ' + (error as Error).message);
    }
  }

  async findAll() {
    return await this.prisma.miembro.findMany();
  }

  async findOne(id: number) {
    const miembro = await this.prisma.miembro.findUnique({
      where: { id_miembro: id },
    });
    
    if (!miembro) throw new NotFoundException(`El miembro con ID ${id} no existe`);
    return miembro;
  }

  update(id: number, updateMiembroDto: UpdateMiembroDto) {
    return `This action updates a #${id} miembro`;
  }

  remove(id: number) {
    return `This action removes a #${id} miembro`;
  }
}
