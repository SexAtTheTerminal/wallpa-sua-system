import {
  IsNumber,
  IsString,
  IsOptional,
  IsDecimal,
  Min,
} from 'class-validator';

class ClienteDataDto {
  @IsString()
  nombre: string;

  @IsString()
  apellidoPaterno: string;

  @IsString()
  @IsOptional()
  apellidoMaterno?: string;
}

export class CreatePagoDto {
  @IsNumber()
  idPedido: number;

  @IsNumber()
  @IsOptional()
  idMetodoPago?: number;

  @IsDecimal()
  @Min(0)
  montoTotal: number;

  @IsString()
  @IsOptional()
  dniCliente?: string;

  @IsOptional()
  clienteData?: ClienteDataDto;
}
