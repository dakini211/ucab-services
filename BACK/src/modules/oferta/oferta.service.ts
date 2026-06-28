import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfertaDto } from './dto/create-oferta.dto';
import { UpdateOfertaDto } from './dto/update-oferta.dto';

@Injectable()
export class OfertaService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateOfertaDto) {
    return this.prisma.oferta.create({ data: createDto });
  }

  findAll() {
    return this.prisma.oferta.findMany();
  }

  findOne(keys: { nombre_entidad: string; cargo: string; id_miembro: number }) {
    return this.prisma.oferta.findUnique({
      where: {
        nombre_entidad_cargo_id_miembro: {
          nombre_entidad: keys.nombre_entidad,
          cargo: keys.cargo,
          id_miembro: BigInt(keys.id_miembro),
        },
      },
    });
  }

  update(keys: { nombre_entidad: string; cargo: string; id_miembro: number }, updateDto: UpdateOfertaDto) {
    return this.prisma.oferta.update({
      where: {
        nombre_entidad_cargo_id_miembro: {
          nombre_entidad: keys.nombre_entidad,
          cargo: keys.cargo,
          id_miembro: BigInt(keys.id_miembro),
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { nombre_entidad: string; cargo: string; id_miembro: number }) {
    return this.prisma.oferta.delete({
      where: {
        nombre_entidad_cargo_id_miembro: {
          nombre_entidad: keys.nombre_entidad,
          cargo: keys.cargo,
          id_miembro: BigInt(keys.id_miembro),
        },
      },
    });
  }
}
