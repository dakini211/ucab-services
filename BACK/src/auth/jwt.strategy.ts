import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { jwtSecret } from './auth.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const miembro = await this.prisma.miembro.findUnique({
      where: { id_miembro: BigInt(payload.sub) },
    });

    if (!miembro) {
      throw new UnauthorizedException();
    }

    return {
      id: Number(miembro.id_miembro),
      email: miembro.correo_institucional,
      nombre: `${miembro.primer_nombre} ${miembro.primer_apellido}`,
    };
  }
}
