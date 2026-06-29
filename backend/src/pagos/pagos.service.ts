import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pago.findMany({
      include: {
        pedido: {
          include: {
            mesa: true,
          },
        },
        metodoPago: true,
        cliente: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(id: number) {
    const pago = await this.prisma.pago.findUnique({
      where: { idPago: id },
      include: {
        pedido: {
          include: {
            mesa: true,
            detallePedidos: {
              include: {
                producto: true,
              },
            },
          },
        },
        metodoPago: true,
        cliente: true,
      },
    });
    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
    return pago;
  }

  async create(createPagoDto: CreatePagoDto) {
    const { idPedido, idMetodoPago, montoTotal, dniCliente, clienteData } =
      createPagoDto;

    return this.prisma.$transaction(async (prisma) => {
      // Verificar/crear cliente si se proporciona DNI
      let clienteRegistrado = null;
      if (dniCliente) {
        clienteRegistrado = await prisma.cliente.findUnique({
          where: { dniCliente },
        });

        if (!clienteRegistrado && clienteData) {
          clienteRegistrado = await prisma.cliente.create({
            data: {
              dniCliente,
              nombreCliente: clienteData.nombre,
              apellPaterno: clienteData.apellidoPaterno,
              apellMaterno: clienteData.apellidoMaterno || '',
            },
          });
        }
      }

      // Crear el pago
      const pago = await prisma.pago.create({
        data: {
          idPedido,
          idMetodoPago,
          montoTotal,
          dniCliente: clienteRegistrado?.dniCliente || dniCliente,
        },
        include: {
          pedido: true,
          metodoPago: true,
          cliente: true,
        },
      });

      // Actualizar estado del pedido a pagado
      await prisma.pedido.update({
        where: { idPedido },
        data: { estadoPagado: true },
      });

      // Liberar la mesa
      const pedido = await prisma.pedido.findUnique({
        where: { idPedido },
        include: { mesa: true },
      });

      if (pedido?.idMesa) {
        await prisma.mesa.update({
          where: { idMesa: pedido.idMesa },
          data: { estado: true },
        });
      }

      return pago;
    });
  }

  async remove(id: number) {
    await this.findById(id);
    await this.prisma.pago.delete({
      where: { idPago: id },
    });
    return { message: 'Pago eliminado correctamente' };
  }

  async getMetodosPago() {
    return this.prisma.metodoPago.findMany({
      orderBy: { nombreMetodo: 'asc' },
    });
  }

  async verificarCliente(dni: string) {
    return this.prisma.cliente.findUnique({
      where: { dniCliente: dni },
    });
  }
}
