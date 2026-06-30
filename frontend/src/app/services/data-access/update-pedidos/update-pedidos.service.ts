import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UpdatePedidosService {
  // NOTA: Este servicio necesita ser migrado al backend REST API
  // Por ahora retorna datos vacíos para que compile

  constructor() {}

  async obtenerPedidos(): Promise<any[]> {
    console.warn('obtenerPedidos: Método no implementado - requiere migración al backend REST API');
    return [];
  }

  async actualizarEstadoPedido(pedido: any): Promise<void> {
    console.warn('actualizarEstadoPedido: Método no implementado - requiere migración al backend REST API');
  }
}
