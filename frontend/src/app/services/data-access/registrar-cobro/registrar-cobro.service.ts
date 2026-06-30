import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RegistrarCobroService {
  // NOTA: Este servicio necesita ser migrado al backend REST API
  // Por ahora retorna datos vacíos para que compile

  async obtenerMesas(): Promise<{ idMesa: number }[]> {
    console.warn('obtenerMesas: Método no implementado - requiere migración al backend REST API');
    return [];
  }

  async obtenerPedidosdelaMesa(mesa: number): Promise<any[]> {
    console.warn('obtenerPedidosdelaMesa: Método no implementado - requiere migración al backend REST API');
    return [];
  }

  async obtenerIds(mesa: number): Promise<any[]> {
    console.warn('obtenerIds: Método no implementado - requiere migración al backend REST API');
    return [];
  }

  async actualizarEstadoMesa(mesa: number): Promise<void> {
    console.warn('actualizarEstadoMesa: Método no implementado - requiere migración al backend REST API');
  }

  async actualizarEstadoPedido(idPedido: number): Promise<void> {
    console.warn('actualizarEstadoPedido: Método no implementado - requiere migración al backend REST API');
  }

  async verificarClienteExiste(dni: string) {
    console.warn('verificarClienteExiste: Método no implementado - requiere migración al backend REST API');
    return null;
  }

  async guardarCliente(clienteData: any) {
    console.warn('guardarCliente: Método no implementado - requiere migración al backend REST API');
    return null;
  }

  async registrarPago(pagoData: any) {
    console.warn('registrarPago: Método no implementado - requiere migración al backend REST API');
    return null;
  }

  async obtenerTiposPago(): Promise<{ id: number; nombre: string }[]> {
    console.warn('obtenerTiposPago: Método no implementado - requiere migración al backend REST API');
    // Retornar datos por defecto
    return [
      { id: 1, nombre: 'Efectivo' },
      { id: 2, nombre: 'Billetera Digital' },
      { id: 3, nombre: 'Tarjeta' },
    ];
  }
}
