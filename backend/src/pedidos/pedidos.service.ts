import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, EstadoPedido } from '../entities/pedido.entity';
import { DetallePedido } from '../entities/detalle-pedido.entity';
import { Item } from '../entities/item.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private detallePedidoRepository: Repository<DetallePedido>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  async findAll(): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      relations: ['usuario', 'detallesPedido', 'detallesPedido.item'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findById(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: ['usuario', 'detallesPedido', 'detallesPedido.item', 'pago'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return pedido;
  }

  async findPendientes(): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      where: { estado: EstadoPedido.PENDIENTE },
      relations: ['usuario', 'detallesPedido', 'detallesPedido.item'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findByMesa(mesaId: number): Promise<Pedido[]> {
    // Convertir el ID a string de mesa (formato: "1" -> "1", "2" -> "2", etc.)
    const nroMesa = mesaId.toString();
    return this.pedidoRepository.find({
      where: { nroMesa },
      relations: ['usuario', 'detallesPedido', 'detallesPedido.item'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    const { items, usuarioId, nroMesa } = createPedidoDto;

    // Calcular el total del pedido
    let total = 0;
    for (const itemDto of items) {
      const item = await this.itemRepository.findOne({
        where: { id: itemDto.itemId },
      });

      if (!item) {
        throw new NotFoundException(`Item con ID ${itemDto.itemId} no encontrado`);
      }

      if (!item.disponible) {
        throw new NotFoundException(`Item "${item.nombre}" no está disponible`);
      }

      total += Number(item.precio) * itemDto.cantidad;
    }

    // Crear el pedido
    const pedido = this.pedidoRepository.create({
      usuarioId,
      nroMesa,
      estado: EstadoPedido.PENDIENTE,
      total,
    });

    const savedPedido = await this.pedidoRepository.save(pedido);

    // Crear los detalles del pedido
    for (const itemDto of items) {
      const item = await this.itemRepository.findOne({
        where: { id: itemDto.itemId },
      });

      if (!item) {
        throw new NotFoundException(`Item con ID ${itemDto.itemId} no encontrado`);
      }

      const detalle = this.detallePedidoRepository.create({
        pedidoId: savedPedido.id,
        itemId: item.id,
        cantidad: itemDto.cantidad,
        precioUnitario: Number(item.precio),
        notas: itemDto.notas,
      });

      await this.detallePedidoRepository.save(detalle);
    }

    return this.findById(savedPedido.id);
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto): Promise<Pedido> {
    const pedido = await this.findById(id);

    if (updatePedidoDto.estado) {
      pedido.estado = updatePedidoDto.estado;
    }

    if (updatePedidoDto.nroMesa) {
      pedido.nroMesa = updatePedidoDto.nroMesa;
    }

    await this.pedidoRepository.save(pedido);

    return this.findById(id);
  }

  async updateEstado(id: number): Promise<Pedido> {
    const pedido = await this.findById(id);

    // Avanzar al siguiente estado
    const estadosOrden = [
      EstadoPedido.PENDIENTE,
      EstadoPedido.EN_COCINA,
      EstadoPedido.LISTO,
      EstadoPedido.ENTREGADO,
      EstadoPedido.PAGADO,
    ];

    const indiceActual = estadosOrden.indexOf(pedido.estado);
    if (indiceActual < estadosOrden.length - 1) {
      pedido.estado = estadosOrden[indiceActual + 1];
    }

    await this.pedidoRepository.save(pedido);
    return this.findById(id);
  }

  async updateEstadoPagado(id: number): Promise<Pedido> {
    const pedido = await this.findById(id);
    pedido.estado = EstadoPedido.PAGADO;
    await this.pedidoRepository.save(pedido);
    return this.findById(id);
  }

  async getMesas(): Promise<{ id: number; numero: string; ocupada: boolean }[]> {
    // Obtener todas las mesas únicas de los pedidos
    const pedidos = await this.pedidoRepository
      .createQueryBuilder('pedido')
      .select('DISTINCT pedido.nroMesa', 'numero')
      .getRawMany();

    // Obtener mesas con pedidos activos (no pagados)
    const pedidosActivos = await this.pedidoRepository.find({
      where: [
        { estado: EstadoPedido.PENDIENTE },
        { estado: EstadoPedido.EN_COCINA },
        { estado: EstadoPedido.LISTO },
        { estado: EstadoPedido.ENTREGADO },
      ],
    });

    const mesasOcupadas = new Set(pedidosActivos.map((p) => p.nroMesa));

    return pedidos.map((p, index) => ({
      id: parseInt(p.numero) || index + 1,
      numero: p.numero,
      ocupada: mesasOcupadas.has(p.numero),
    }));
  }

  async getMesasDisponibles(): Promise<{ id: number; numero: string }[]> {
    const todasLasMesas = await this.getMesas();
    return todasLasMesas
      .filter((mesa) => !mesa.ocupada)
      .map(({ id, numero }) => ({ id, numero }));
  }

  async getModalidades(): Promise<{ id: number; nombre: string }[]> {
    // Las modalidades no están en el schema actual, retornar valores por defecto
    return [
      { id: 1, nombre: 'Para llevar' },
      { id: 2, nombre: 'En mesa' },
    ];
  }

  async updateMesaEstado(mesaId: number): Promise<{ message: string }> {
    // Actualizar todos los pedidos de una mesa a estado PAGADO
    const nroMesa = mesaId.toString();
    const pedidos = await this.pedidoRepository.find({
      where: { nroMesa },
    });

    for (const pedido of pedidos) {
      if (pedido.estado !== EstadoPedido.PAGADO) {
        pedido.estado = EstadoPedido.PAGADO;
        await this.pedidoRepository.save(pedido);
      }
    }

    return { message: `Mesa ${nroMesa} marcada como disponible` };
  }

  async remove(id: number): Promise<{ message: string }> {
    const pedido = await this.findById(id);
    await this.pedidoRepository.remove(pedido);
    return { message: 'Pedido eliminado correctamente' };
  }
}
