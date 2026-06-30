import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago, MetodoPagoEnum } from '../entities/pago.entity';
import { Pedido, EstadoPedido } from '../entities/pedido.entity';
import { Comprobante } from '../entities/comprobante.entity';
import { CreatePagoDto } from './dto/create-pago.dto';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(Comprobante)
    private comprobanteRepository: Repository<Comprobante>,
  ) {}

  async findAll(): Promise<Pago[]> {
    return this.pagoRepository.find({
      relations: ['pedido', 'pedido.detallesPedido', 'pedido.detallesPedido.item', 'cajero', 'comprobantes'],
      order: { fechaPago: 'DESC' },
    });
  }

  async findById(id: number): Promise<Pago> {
    const pago = await this.pagoRepository.findOne({
      where: { id },
      relations: ['pedido', 'pedido.detallesPedido', 'pedido.detallesPedido.item', 'cajero', 'comprobantes'],
    });

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return pago;
  }

  async create(createPagoDto: CreatePagoDto): Promise<Pago> {
    const { pedidoId, cajeroId, montoPagado, metodoPago } = createPagoDto;

    // Verificar que el pedido existe
    const pedido = await this.pedidoRepository.findOne({
      where: { id: pedidoId },
      relations: ['pago'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);
    }

    // Verificar que el pedido no esté ya pagado
    if (pedido.pago) {
      throw new BadRequestException(`El pedido ya tiene un pago registrado`);
    }

    // Verificar que el monto pagado sea suficiente
    if (montoPagado < Number(pedido.total)) {
      throw new BadRequestException(
        `El monto pagado (${montoPagado}) es menor al total del pedido (${pedido.total})`
      );
    }

    // Crear el pago
    const pago = this.pagoRepository.create({
      pedidoId,
      cajeroId,
      montoPagado,
      metodoPago,
    });

    const savedPago = await this.pagoRepository.save(pago);

    // Actualizar el estado del pedido a PAGADO
    pedido.estado = EstadoPedido.PAGADO;
    await this.pedidoRepository.save(pedido);

    return this.findById(savedPago.id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const pago = await this.findById(id);

    // Verificar si tiene comprobantes asociados
    if (pago.comprobantes && pago.comprobantes.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar el pago porque tiene comprobantes asociados'
      );
    }

    // Actualizar el estado del pedido
    const pedido = await this.pedidoRepository.findOne({
      where: { id: pago.pedidoId },
    });

    if (pedido) {
      pedido.estado = EstadoPedido.ENTREGADO;
      await this.pedidoRepository.save(pedido);
    }

    await this.pagoRepository.remove(pago);

    return { message: 'Pago eliminado correctamente' };
  }

  /**
   * Obtener todos los métodos de pago disponibles
   */
  async getMetodosPago(): Promise<{ value: string; label: string }[]> {
    return Object.values(MetodoPagoEnum).map((metodo) => ({
      value: metodo,
      label: this.formatMetodoPago(metodo),
    }));
  }

  private formatMetodoPago(metodo: MetodoPagoEnum): string {
    const formats = {
      [MetodoPagoEnum.EFECTIVO]: 'Efectivo',
      [MetodoPagoEnum.TARJETA]: 'Tarjeta',
      [MetodoPagoEnum.YAPE]: 'Yape',
      [MetodoPagoEnum.PLIN]: 'Plin',
    };
    return formats[metodo] || metodo;
  }

  /**
   * Verificar si existe un cliente con el DNI proporcionado en comprobantes previos
   */
  async verificarCliente(dni: string): Promise<{ exists: boolean; nombre?: string }> {
    const comprobante = await this.comprobanteRepository.findOne({
      where: { clienteDocumento: dni },
      order: { fechaEmision: 'DESC' },
    });

    if (comprobante) {
      return {
        exists: true,
        nombre: comprobante.clienteNombre,
      };
    }

    return { exists: false };
  }
}
