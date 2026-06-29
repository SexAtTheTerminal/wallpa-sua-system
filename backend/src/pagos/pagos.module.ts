import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { Pago } from '../entities/pago.entity';
import { Pedido } from '../entities/pedido.entity';
import { Comprobante } from '../entities/comprobante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Pedido, Comprobante])],
  providers: [PagosService],
  controllers: [PagosController],
  exports: [PagosService],
})
export class PagosModule {}
