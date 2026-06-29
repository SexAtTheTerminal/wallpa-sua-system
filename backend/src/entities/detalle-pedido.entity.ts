import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Item } from './item.entity';

@Entity('detalles_pedido')
export class DetallePedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pedido_id' })
  pedidoId: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.detallesPedido, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @Column({ name: 'item_id' })
  itemId: number;

  @ManyToOne(() => Item, (item) => item.detallesPedido, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ name: 'precio_unitario', type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'text', nullable: true })
  notas: string;
}
