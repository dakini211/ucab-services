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
            administrativo: { include: { admid_general: true } },
            profesor: true,
          },
        },
        egresado: true,
        billetera_digital: true,
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
    else if (miembro.personal_ucab?.administrativo) {
      rol = miembro.personal_ucab.administrativo.admid_general ? 'Admin' : 'Administrativo';
    }
    else if (miembro.estudiante) rol = 'Estudiante';
    else if (miembro.egresado) rol = 'Egresado';

    // 4. Generar JWT
    const payload = {
      sub: miembro.id_miembro.toString(),
      email: miembro.correo_institucional,
    };
    const access_token = this.jwtService.sign(payload);

    // Ajustar a hora local (UTC-4 para Venezuela)
    const now = new Date();
    const localNow = new Date(now.getTime() - (4 * 60 * 60 * 1000));

    // 5. Registrar sesión en historial (opcional, ignorar errores)
    this.prisma.historial_sesiones
      .create({
        data: {
          id_miembro: miembro.id_miembro,
          lugar_conexion: 'WEB',
          direccion_ip: '127.0.0.1',
          fecha_inicio: localNow,
          hora_inicio: localNow,
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
        tai_uid: miembro.billetera_digital?.uid || null,
        tai_saldo: miembro.billetera_digital ? Number(miembro.billetera_digital.saldo) : null,
      },
    };
  }

  async getMe(userId: string) {
    const miembro = await this.prisma.miembro.findUnique({
      where: { id_miembro: BigInt(userId) },
      include: {
        estudiante: true,
        personal_ucab: { include: { administrativo: { include: { admid_general: true } }, profesor: true } },
        egresado: true,
        billetera_digital: true,
      },
    });

    if (!miembro) throw new UnauthorizedException();

    // Buscar la última sesión completada (con hora_fin) para mostrar "última conexión"
    const ultimaSesion = await this.prisma.historial_sesiones.findFirst({
      where: {
        id_miembro: BigInt(userId),
        hora_fin: { not: null },
      },
      orderBy: {
        identificador_uuid: 'desc'
      }
    });

    let ultima_conexion = 'Primera sesión';
    if (ultimaSesion && ultimaSesion.hora_fin) {
      const fecha = ultimaSesion.fecha_inicio instanceof Date 
        ? ultimaSesion.fecha_inicio.toISOString().split('T')[0] 
        : String(ultimaSesion.fecha_inicio).split('T')[0];
      
      const horaObj = ultimaSesion.hora_fin;
      let timeStr = '';
      if (horaObj instanceof Date) {
        timeStr = horaObj.toISOString().split('T')[1].substring(0, 5);
      } else {
        timeStr = String(horaObj).includes('T') ? String(horaObj).split('T')[1].substring(0, 5) : String(horaObj).substring(0, 5);
      }
      ultima_conexion = `${fecha} a las ${timeStr}`;
    }

    let rol = 'Miembro';
    if (miembro.personal_ucab?.profesor) rol = 'Profesor';
    else if (miembro.personal_ucab?.administrativo) {
      rol = miembro.personal_ucab.administrativo.admid_general ? 'Admin' : 'Administrativo';
    }
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
      ultima_conexion,
      tai_uid: miembro.billetera_digital?.uid || null,
      tai_saldo: miembro.billetera_digital ? Number(miembro.billetera_digital.saldo) : null,
    };
  }

  async logout(userId: string) {
    const userIdBigInt = BigInt(userId);
    // Encontrar la sesión más reciente sin hora_fin
    const sesion = await this.prisma.historial_sesiones.findFirst({
      where: {
        id_miembro: userIdBigInt,
        hora_fin: null,
      },
      orderBy: {
        identificador_uuid: 'desc'
      }
    });

    if (sesion) {
      // Ajustar a hora local (UTC-4 para Venezuela)
      const now = new Date();
      const localNow = new Date(now.getTime() - (4 * 60 * 60 * 1000));

      await this.prisma.historial_sesiones.update({
        where: {
          id_miembro_identificador_uuid: {
            id_miembro: userIdBigInt,
            identificador_uuid: sesion.identificador_uuid,
          }
        },
        data: {
          hora_fin: localNow
        }
      });
    }
    return { success: true };
  }
}
