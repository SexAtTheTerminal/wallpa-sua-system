import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { Pago } from './pago.entity';

export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  EN_COCINA = 'en_cocina',
  LISTO = 'listo',
  ENTREGADO = 'entregado',
  PAGADO = 'pagado',
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.pedidos, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'nro_mesa', type: 'varchar', length: 10 })
  nroMesa: string;

  @Column({
    type: 'enum',
    enum: EstadoPedido,
    default: EstadoPedido.PENDIENTE,
  })
  estado: EstadoPedido;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion: Date;

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido)
  detallesPedido: DetallePedido[];

  @OneToOne(() => Pago, (pago) => pago.pedido)
  pago: Pago;
}
