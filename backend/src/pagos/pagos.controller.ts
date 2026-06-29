import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';

@Controller('pagos')
@UseGuards(AuthGuard('jwt'))
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get()
  findAll() {
    return this.pagosService.findAll();
  }

  @Get('metodos')
  getMetodosPago() {
    return this.pagosService.getMetodosPago();
  }

  @Get('verificar-cliente/:dni')
  verificarCliente(@Param('dni') dni: string) {
    return this.pagosService.verificarCliente(dni);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosService.findById(Number(id));
  }

  @Post()
  create(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.create(createPagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosService.remove(Number(id));
  }
}
