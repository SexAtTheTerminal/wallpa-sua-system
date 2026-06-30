import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReceiptsService {
  // NOTA: Este servicio necesita ser migrado al backend REST API
  // Por ahora retorna datos vacíos para que compile

  constructor() {}

  async obtenerPagosDesdeDB(): Promise<any[]> {
    console.warn('obtenerPagosDesdeDB: Método no implementado - requiere migración al backend REST API');
    return [];
  }

  async eliminarPago(idPago: number): Promise<boolean> {
    console.warn('eliminarPago: Método no implementado - requiere migración al backend REST API');
    return false;
  }

  async obtenerDetallePedido(idPedido: number): Promise<any[]> {
    console.warn('obtenerDetallePedido: Método no implementado - requiere migración al backend REST API');
    return [];
  }
}
