import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrarPedidosService {
  // NOTA: Este servicio necesita ser migrado al backend REST API
  // Por ahora retorna datos vacíos para que compile

  private readonly pedidoRegistradoSubject = new BehaviorSubject<void>(undefined);
  pedidoRegistrado$ = this.pedidoRegistradoSubject.asObservable();

  notificarNuevoPedido() {
    this.pedidoRegistradoSubject.next();
  }

  constructor() {}

  async agregarPedidoConDetalles(
    idMesa: number,
    idModalidad: number,
    montoTotal: number,
    estado: boolean,
    items: any[]
  ): Promise<boolean> {
    console.warn('agregarPedidoConDetalles: Método no implementado - requiere migración al backend REST API');
    return false;
  }

  async obtenerMesas(): Promise<any[]> {
    console.warn('obtenerMesas: Método no implementado - requiere migración al backend REST API');
    return [];
  }

  async obtenerModalidad(): Promise<any[]> {
    console.warn('obtenerModalidad: Método no implementado - requiere migración al backend REST API');
    return [];
  }

  async obtenerUltimoIdPedido(): Promise<number | null> {
    console.warn('obtenerUltimoIdPedido: Método no implementado - requiere migración al backend REST API');
    return null;
  }

  async generarNuevoCodigoPedido(): Promise<string> {
    console.warn('generarNuevoCodigoPedido: Método no implementado - requiere migración al backend REST API');
    return 'PD-00000001';
  }

  async obtenerProductosDesdeDB(): Promise<any[]> {
    console.warn('obtenerProductosDesdeDB: Método no implementado - requiere migración al backend REST API');
    return [];
  }
}
