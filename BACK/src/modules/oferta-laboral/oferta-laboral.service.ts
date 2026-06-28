import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfertaLaboralDto } from './dto/create-oferta-laboral.dto';
import { UpdateOfertaLaboralDto } from './dto/update-oferta-laboral.dto';

@Injectable()
export class OfertaLaboralService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateOfertaLaboralDto) {
    return this.prisma.oferta_laboral.create({ data: createDto });
  }

  findAll() {
    return this.prisma.oferta_laboral.findMany();
  }

  findOne(keys: { nombre_entidad: string; cargo: string }) {
    return this.prisma.oferta_laboral.findUnique({
      where: {
        nombre_entidad_cargo: {
          nombre_entidad: keys.nombre_entidad,
          cargo: keys.cargo,
        },
      },
    });
  }

  update(keys: { nombre_entidad: string; cargo: string }, updateDto: UpdateOfertaLaboralDto) {
    return this.prisma.oferta_laboral.update({
      where: {
        nombre_entidad_cargo: {
          nombre_entidad: keys.nombre_entidad,
          cargo: keys.cargo,
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { nombre_entidad: string; cargo: string }) {
    return this.prisma.oferta_laboral.delete({
      where: {
        nombre_entidad_cargo: {
          nombre_entidad: keys.nombre_entidad,
          cargo: keys.cargo,
        },
      },
    });
  }
}
