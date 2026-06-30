import { Component, OnInit } from '@angular/core';
import { SidebarAdminComponent } from '../../../sidebar/features/sidebar-admin/sidebar-admin.component';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReceiptsService } from '../../../services/data-access/receipts-service/receipts-service.service';
import { ApiPeruService } from '../../../shared/data-access/api-peru.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, SidebarAdminComponent, RouterLink],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  sidebarCollapsed = false;
  pago: any = null;
  productos: any[] = [];
  cargandoProductos = true;
  cargandoCliente = false;
  nombreCliente: string = 'Cargando...';

  constructor(
    private readonly router: Router,
    private readonly receiptsService: ReceiptsService,
    private readonly apiPeruService: ApiPeruService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.pago = navigation.extras.state['pago'];
    }
  }

  ngOnInit(): void {
    // La verificación de autenticación la manejan los guards de Angular
    if (this.pago?.idPedido) {
      this.receiptsService
        .obtenerDetallePedido(this.pago.idPedido)
        .then((productos) => {
          this.productos = productos;
        })
        .catch((error) => {
          console.error('Error al obtener detalles del pedido:', error);
        })
        .finally(() => {
          this.cargandoProductos = false;
        });
    }

    // Obtener nombre del cliente desde API Perú si hay DNI
    if (this.pago?.dniCliente) {
      this.obtenerNombreCliente(this.pago.dniCliente);
    } else {
      this.nombreCliente = 'Sin especificar';
    }
  }

  obtenerNombreCliente(dni: string) {
    this.cargandoCliente = true;
    this.apiPeruService
      .buscarPorDni(dni)
      .pipe(finalize(() => (this.cargandoCliente = false)))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.nombreCliente = `${response.data.nombres} ${response.data.apellido_paterno} ${response.data.apellido_materno}`;
          } else {
            this.nombreCliente = 'No encontrado';
          }
        },
        error: (err) => {
          console.error('Error al obtener datos del cliente:', err);
          this.nombreCliente = 'Error al cargar';
        },
      });
  }

  onSidebarToggle(state: boolean): void {
    this.sidebarCollapsed = state;
  }
}
