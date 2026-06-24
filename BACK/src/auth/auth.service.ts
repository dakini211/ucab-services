import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Buscar miembro por correo institucional
    const miembro = await this.prisma.miembro.findUnique({
      where: { correo_institucional: email },
      include: {
        historial_contrasena: {
          // La contraseña activa es la que tiene fecha_fin NULL o es la más reciente
          where: { fecha_fin: null },
          orderBy: { fecha_inicio: 'desc' },
          take: 1,
        },
        estudiante: true,
        personal_ucab: {
          include: {
            administrativo: true,
            profesor: true,
          },
        },
        egresado: true,
      },
    });

    if (!miembro) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    if (miembro.estado_cuenta !== 'activa') {
      throw new UnauthorizedException('Tu cuenta se encuentra inactiva. Contacta a soporte.');
    }

    if (!miembro.historial_contrasena || miembro.historial_contrasena.length === 0) {
      throw new UnauthorizedException('No hay contraseña configurada para este usuario.');
    }

    const contrasenaActual = miembro.historial_contrasena[0].contrasena;

    // 2. Verificar contraseña: intentar bcrypt, si falla comparar texto plano (dev)
    let passwordValida = false;

    // Detectar si es un hash bcrypt (empieza con $2b$ o $2a$)
    if (contrasenaActual.startsWith('$2b$') || contrasenaActual.startsWith('$2a$')) {
      passwordValida = await bcrypt.compare(password, contrasenaActual);
    } else {
      // Texto plano — solo en desarrollo
      passwordValida = password === contrasenaActual;
    }

    if (!passwordValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    // 3. Determinar rol basado en las relaciones
    let rol = 'Miembro';
    if (miembro.personal_ucab?.profesor) rol = 'Profesor';
    else if (miembro.personal_ucab?.administrativo) rol = 'Administrativo';
    else if (miembro.estudiante) rol = 'Estudiante';
    else if (miembro.egresado) rol = 'Egresado';

    // 4. Generar JWT
    const payload = {
      sub: miembro.id_miembro.toString(),
      email: miembro.correo_institucional,
    };
    const access_token = this.jwtService.sign(payload);

    // 5. Registrar sesión en historial (opcional, ignorar errores)
    this.prisma.historial_sesiones
      .create({
        data: {
          id_miembro: miembro.id_miembro,
          lugar_conexion: 'WEB',
          direccion_ip: '127.0.0.1',
          fecha_inicio: new Date(),
          hora_inicio: new Date(),
        },
      })
      .catch(() => null);

    return {
      access_token,
      token_type: 'Bearer',
      user: {
        id: Number(miembro.id_miembro),
        email: miembro.correo_institucional,
        nombre: `${miembro.primer_nombre}${miembro.segundo_nombre ? ' ' + miembro.segundo_nombre : ''} ${miembro.primer_apellido}`,
        rol,
        cedula: miembro.cedula_identidad,
      },
    };
  }

  async getMe(userId: string) {
    const miembro = await this.prisma.miembro.findUnique({
      where: { id_miembro: BigInt(userId) },
      include: {
        estudiante: true,
        personal_ucab: { include: { administrativo: true, profesor: true } },
        egresado: true,
      },
    });

    if (!miembro) throw new UnauthorizedException();

    let rol = 'Miembro';
    if (miembro.personal_ucab?.profesor) rol = 'Profesor';
    else if (miembro.personal_ucab?.administrativo) rol = 'Administrativo';
    else if (miembro.estudiante) rol = 'Estudiante';
    else if (miembro.egresado) rol = 'Egresado';

    return {
      id: Number(miembro.id_miembro),
      email: miembro.correo_institucional,
      nombre: `${miembro.primer_nombre}${miembro.segundo_nombre ? ' ' + miembro.segundo_nombre : ''} ${miembro.primer_apellido}`,
      rol,
      cedula: miembro.cedula_identidad,
      telefono: miembro.telefono,
      estado_cuenta: miembro.estado_cuenta,
    };
  }
}
