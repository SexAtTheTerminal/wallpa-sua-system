import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pago } from './pago.entity';

export enum TipoComprobanteEnum {
  BOLETA = 'boleta',
  FACTURA = 'factura',
}

@Entity('comprobantes')
export class Comprobante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pago_id' })
  pagoId: number;

  @ManyToOne(() => Pago, (pago) => pago.comprobantes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pago_id' })
  pago: Pago;

  @Column({
    name: 'tipo_comprobante',
    type: 'enum',
    enum: TipoComprobanteEnum,
  })
  tipoComprobante: TipoComprobanteEnum;

  @Column({ type: 'varchar', length: 4 })
  serie: string;

  @Column({ type: 'int' })
  numero: number;

  @Column({ name: 'cliente_documento', type: 'varchar', length: 11 })
  clienteDocumento: string;

  @Column({ name: 'cliente_nombre', type: 'varchar', length: 255 })
  clienteNombre: string;

  @Column({ name: 'monto_subtotal', type: 'decimal', precision: 10, scale: 2 })
  montoSubtotal: number;

  @Column({ name: 'monto_igv', type: 'decimal', precision: 10, scale: 2 })
  montoIgv: number;

  @Column({ name: 'monto_total', type: 'decimal', precision: 10, scale: 2 })
  montoTotal: number;

  @CreateDateColumn({ name: 'fecha_emision', type: 'timestamptz' })
  fechaEmision: Date;
}
