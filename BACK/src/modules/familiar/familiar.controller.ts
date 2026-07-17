import { Controller, Post, Get, Body, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { FamiliarService } from './familiar.service';
import { CreateFamiliarDto } from './dto/create-familiar.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('familiar')
export class FamiliarController {
  constructor(private readonly familiarService: FamiliarService) {}

  @Post('registrar')
  @UseGuards(AuthGuard('jwt'))
  async registrarFamiliar(@Req() req, @Body() dto: CreateFamiliarDto) {
    const user = req.user;
    if (user.rol !== 'Profesor' && user.rol !== 'Administrativo') {
      throw new HttpException('Solo el Profesor y Administrativo pueden registrar familiares', HttpStatus.FORBIDDEN);
    }
    return this.familiarService.registrarFamiliar(user.id, dto);
  }

  @Get('mis-familiares')
  @UseGuards(AuthGuard('jwt'))
  async getMisFamiliares(@Req() req) {
    const user = req.user;
    if (user.rol !== 'Profesor' && user.rol !== 'Administrativo') {
      throw new HttpException('Solo el Profesor y Administrativo tienen beneficiarios', HttpStatus.FORBIDDEN);
    }
    return this.familiarService.getMisFamiliares(user.id);
  }

  @Get('todos')
  @UseGuards(AuthGuard('jwt'))
  async getTodosFamiliares(@Req() req) {
    const user = req.user;
    if (user.rol !== 'Admin') {
      throw new HttpException('Solo el Admin General puede ver todos los familiares asignados', HttpStatus.FORBIDDEN);
    }
    return this.familiarService.getTodosFamiliares();
  }
}
