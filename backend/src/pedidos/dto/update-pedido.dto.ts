import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoPedido } from '../../entities/pedido.entity';

export class UpdatePedidoDto {
  @IsEnum(EstadoPedido)
  @IsOptional()
  estado?: EstadoPedido;

  @IsString()
  @IsOptional()
  nroMesa?: string;
}
