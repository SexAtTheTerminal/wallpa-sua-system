import {
  IsNumber,
  IsString,
  IsEnum,
  IsUUID,
  Min,
} from 'class-validator';
import { MetodoPagoEnum } from '../../entities/pago.entity';

export class CreatePagoDto {
  @IsNumber()
  pedidoId: number;

  @IsUUID()
  cajeroId: string;

  @IsNumber()
  @Min(0)
  montoPagado: number;

  @IsEnum(MetodoPagoEnum)
  metodoPago: MetodoPagoEnum;
}
