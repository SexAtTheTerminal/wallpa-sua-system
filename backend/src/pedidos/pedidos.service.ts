import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pedido.findMany({
      include: {
        mesa: true,
        modalidad: true,
        detallePedidos: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findById(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { idPedido: id },
      include: {
        mesa: true,
        modalidad: true,
        detallePedidos: {
          include: {
            producto: true,
          },
        },
      },
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }
    return pedido;
  }

  async findPendientes() {
    return this.prisma.pedido.findMany({
      where: { estado: false },
      include: {
        mesa: true,
        modalidad: true,
        detallePedidos: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findByMesa(mesaId: number) {
    return this.prisma.pedido.findMany({
      where: {
        idMesa: mesaId,
        estado: true,
        estadoPagado: false,
      },
      include: {
        detallePedidos: {
          include: {
            producto: true,
          },
        },
      },
    });
  }

  async create(createPedidoDto: CreatePedidoDto) {
    const { items, ...pedidoData } = createPedidoDto;

    // Calcular monto total
    let montoTotal = 0;
    for (const item of items) {
      const producto = await this.prisma.producto.findUnique({
        where: { idProducto: item.idProducto },
      });
      if (producto) {
        montoTotal += Number(producto.precio) * item.cantidad;
      }
    }

    // Crear pedido con detalles en transacción
    const pedido = await this.prisma.$transaction(async (prisma) => {
      // Crear el pedido
      const nuevoPedido = await prisma.pedido.create({
        data: {
          idMesa: pedidoData.idMesa,
          idModalidad: pedidoData.idModalidad,
          montoTotal,
          estado: false,
          estadoPagado: false,
        },
      });

      // Crear detalles del pedido
      for (const item of items) {
        const producto = await prisma.producto.findUnique({
          where: { idProducto: item.idProducto },
        });
        if (producto) {
          await prisma.detallePedido.create({
            data: {
              idPedido: nuevoPedido.idPedido,
              idProducto: item.idProducto,
              cantidad: item.cantidad,
              subTotal: Number(producto.precio) * item.cantidad,
            },
          });
        }
      }

      // Actualizar estado de la mesa a ocupada
      if (pedidoData.idMesa) {
        await prisma.mesa.update({
          where: { idMesa: pedidoData.idMesa },
          data: { estado: false },
        });
      }

      return nuevoPedido;
    });

    return this.findById(pedido.idPedido);
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    await this.findById(id);

    return this.prisma.pedido.update({
      where: { idPedido: id },
      data: updatePedidoDto,
      include: {
        mesa: true,
        modalidad: true,
        detallePedidos: {
          include: {
            producto: true,
          },
        },
      },
    });
  }

  async updateEstado(id: number) {
    const pedido = await this.findById(id);
    return this.prisma.pedido.update({
      where: { idPedido: id },
      data: { estado: !pedido.estado },
      include: {
        mesa: true,
        modalidad: true,
        detallePedidos: {
          include: {
            producto: true,
          },
        },
      },
    });
  }

  async updateEstadoPagado(id: number) {
    const pedido = await this.findById(id);
    return this.prisma.pedido.update({
      where: { idPedido: id },
      data: { estadoPagado: !pedido.estadoPagado },
    });
  }

  async remove(id: number) {
    await this.findById(id);
    await this.prisma.pedido.delete({
      where: { idPedido: id },
    });
    return { message: 'Pedido eliminado correctamente' };
  }

  async getMesas() {
    return this.prisma.mesa.findMany({
      orderBy: { numeroMesa: 'asc' },
    });
  }

  async getMesasDisponibles() {
    return this.prisma.mesa.findMany({
      where: { estado: true },
      orderBy: { numeroMesa: 'asc' },
    });
  }

  async getModalidades() {
    return this.prisma.modalidad.findMany({
      orderBy: { nombreModalidad: 'asc' },
    });
  }

  async updateMesaEstado(idMesa: number) {
    const mesa = await this.prisma.mesa.findUnique({
      where: { idMesa },
    });
    if (!mesa) {
      throw new NotFoundException(`Mesa con ID ${idMesa} no encontrada`);
    }
    return this.prisma.mesa.update({
      where: { idMesa },
      data: { estado: !mesa.estado },
    });
  }
}
