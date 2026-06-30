import { Component, OnInit, inject } from '@angular/core';
import { ReceiptsService } from '../../../services/data-access/receipts-service/receipts-service.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SidebarAdminComponent } from '../../../sidebar/features/sidebar-admin/sidebar-admin.component';
import { FiltrosReceiptsComponent } from '../../../shared/modals/filtros-receipts/filtros-receipts.component';
import { TablaReceiptsComponent } from '../../../shared/modals/tabla-receipts/tabla-receipts.component';

@Component({
  selector: 'app-receipts',
  standalone: true,
  imports: [
    SidebarAdminComponent,
    CommonModule,
    RouterLink,
    TablaReceiptsComponent,
    FiltrosReceiptsComponent,
  ],
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.scss'],
})
export class ReceiptsComponent implements OnInit {
  sidebarCollapsed = false;

  // Filtros
  busquedaCodigo = '';
  metodoSeleccionado = '';
  ordenFecha: string = 'reciente';

  // Datos
  pagos: any[] = [];
  pagosFiltrados: any[] = [];

  // UI
  mensajeExito = '';

  private readonly router = inject(Router);

  constructor(private readonly receiptsService: ReceiptsService) {}

  ngOnInit(): void {
    // La verificación de autenticación la manejan los guards de Angular
    this.cargarPagos();
  }

  private async cargarPagos(): Promise<void> {
    this.pagos = await this.receiptsService.obtenerPagosDesdeDB();
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const codigo = this.busquedaCodigo.toLowerCase();
    const metodo = this.metodoSeleccionado;

    // Filtrar por código y método de pago
    this.pagosFiltrados = this.pagos.filter(
      (pago) =>
        pago.codigo.toLowerCase().includes(codigo) &&
        (metodo ? pago.metodoPago === metodo : true)
    );

    // Ordenar por fecha
    this.pagosFiltrados.sort((a, b) => {
      return this.ordenFecha === 'reciente'
        ? b.fecha.getTime() - a.fecha.getTime()
        : a.fecha.getTime() - b.fecha.getTime();
    });
  }

  verDetalle(pago: any): void {
    // Navegar al componente de detalles con el ID del pago como parámetro
    this.router.navigate(['/admin/details'], {
      state: { pago: pago },
    });
  }

  async eliminarPago(pago: any): Promise<void> {
    const confirmado = confirm(`¿Eliminar el pago ${pago.codigo}?`);
    if (!confirmado) return;

    const exito = await this.receiptsService.eliminarPago(pago.idPago);

    if (exito) {
      this.pagos = this.pagos.filter((p) => p.idPago !== pago.idPago);
      this.aplicarFiltros();

      this.mostrarMensajeExito(`Pago ${pago.codigo} eliminado correctamente`);
    } else {
      alert('Ocurrió un error al eliminar el pago');
    }
  }

  mostrarMensajeExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    setTimeout(() => (this.mensajeExito = ''), 3000);
  }

  async reiniciarFiltros() {
    this.busquedaCodigo = '';
    this.metodoSeleccionado = '';
    this.pagos = await this.receiptsService.obtenerPagosDesdeDB();
    this.aplicarFiltros();
  }

  onSidebarToggle(state: boolean): void {
    this.sidebarCollapsed = state;
  }
}
