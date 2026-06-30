import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConsultarPedidosService {
  // NOTA: Este servicio necesita ser migrado al backend REST API
  // Por ahora retorna datos vacíos para que compile

  constructor() {}

  async obtenerPedidosDesdeDB(): Promise<any[]> {
    console.warn('obtenerPedidosDesdeDB: Método no implementado - requiere migración al backend REST API');
    return [];
  }

  async eliminarPedido(idPedido: number): Promise<boolean> {
    console.warn('eliminarPedido: Método no implementado - requiere migración al backend REST API');
    return false;
  }
}
