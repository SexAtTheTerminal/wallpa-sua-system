import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Controller('pedidos')
@UseGuards(AuthGuard('jwt'))
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get('pendientes')
  findPendientes() {
    return this.pedidosService.findPendientes();
  }

  @Get('mesas')
  getMesas() {
    return this.pedidosService.getMesas();
  }

  @Get('mesas/disponibles')
  getMesasDisponibles() {
    return this.pedidosService.getMesasDisponibles();
  }

  @Get('modalidades')
  getModalidades() {
    return this.pedidosService.getModalidades();
  }

  @Get('mesa/:id')
  findByMesa(@Param('id') id: string) {
    return this.pedidosService.findByMesa(Number(id));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findById(Number(id));
  }

  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidosService.update(Number(id), updatePedidoDto);
  }

  @Put(':id/estado')
  updateEstado(@Param('id') id: string) {
    return this.pedidosService.updateEstado(Number(id));
  }

  @Put(':id/pagado')
  updateEstadoPagado(@Param('id') id: string) {
    return this.pedidosService.updateEstadoPagado(Number(id));
  }

  @Put('mesa/:id/estado')
  updateMesaEstado(@Param('id') id: string) {
    return this.pedidosService.updateMesaEstado(Number(id));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(Number(id));
  }
}
