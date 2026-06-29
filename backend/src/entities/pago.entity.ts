import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Usuario } from './usuario.entity';
import { Comprobante } from './comprobante.entity';

export enum MetodoPagoEnum {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  YAPE = 'yape',
  PLIN = 'plin',
}

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pedido_id' })
  pedidoId: number;

  @OneToOne(() => Pedido, (pedido) => pedido.pago, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @Column({ name: 'cajero_id', type: 'uuid', nullable: true })
  cajeroId: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.pagos, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'cajero_id' })
  cajero: Usuario;

  @Column({ name: 'monto_pagado', type: 'decimal', precision: 10, scale: 2 })
  montoPagado: number;

  @Column({
    name: 'metodo_pago',
    type: 'enum',
    enum: MetodoPagoEnum,
  })
  metodoPago: MetodoPagoEnum;

  @CreateDateColumn({ name: 'fecha_pago', type: 'timestamptz' })
  fechaPago: Date;

  @OneToMany(() => Comprobante, (comprobante) => comprobante.pago)
  comprobantes: Comprobante[];
}
