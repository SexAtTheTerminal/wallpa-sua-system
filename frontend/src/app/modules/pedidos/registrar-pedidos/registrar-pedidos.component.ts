import { Component, OnInit, inject } from '@angular/core';
import { SidebarCasherComponent } from '../../../sidebar/features/sidebar-casher/sidebar-casher.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemSearchComponent } from '../../../shared/modals/item-search/item-search.component';
import { RegistrarPedidosService } from '../../../services/data-access/registrar-pedidos/registrar-pedidos.service';

interface Mesa {
  idMesa: number;
  numeroMesa: string;
}

interface Modalidad {
  idModalidad: number;
  nombreModalidad: string;
}

@Component({
  selector: 'app-registrar-pedidos',
  imports: [
    SidebarCasherComponent,
    CommonModule,
    RouterLink,
    FormsModule,
    ItemSearchComponent,
  ],
  templateUrl: './registrar-pedidos.component.html',
  styleUrl: './registrar-pedidos.component.scss',
})
export class RegistrarPedidosComponent implements OnInit {
  sidebarCollapsed = false;
  items: any[] = [];
  mesas: any[] = [];
  modalidades: any[] = [];
  showItemSearch = false;
  modalidadSeleccionada: Modalidad | null = null;
  mesaSeleccionada: Mesa | null = null;
  ultimoId!: number | null;
  nuevoCodigo: string = '';
  registrandoPedido = false;

  private readonly registrarPedidosService = inject(RegistrarPedidosService);

  ngOnInit(): void {
    // La verificación de autenticación la manejan los guards de Angular
    (async () => {
      try {
        const [mesas, modalidades, ultimoId] = await Promise.all([
          this.registrarPedidosService.obtenerMesas(),
          this.registrarPedidosService.obtenerModalidad(),
          this.registrarPedidosService.obtenerUltimoIdPedido(),
        ]);

        this.mesas = mesas;
        this.modalidades = modalidades;
        this.ultimoId = ultimoId;

        this.nuevoCodigo =
          await this.registrarPedidosService.generarNuevoCodigoPedido();

        // Suscribirse para actualizar automáticamente el código
        this.registrarPedidosService.pedidoRegistrado$.subscribe(async () => {
          this.nuevoCodigo =
            await this.registrarPedidosService.generarNuevoCodigoPedido();
        });
      } catch (error) {
        console.error('Error en ngOnInit:', error);
        this.nuevoCodigo = 'PD-????????';
      }
    })();
  }

  onSidebarToggle(state: boolean): void {
    this.sidebarCollapsed = state;
  }

  agregarItem(item: any) {
    const isCopy = this.items.some((i) => i.id === item.id);
    if (!isCopy) {
      const nuevo = {
        ...item,
      };
      this.items.push(nuevo);
    } else {
      console.log('Ya fue agregado');
    }
  }

  agregarItemsMultiples(itemsPopup: any[]) {
    const idsPopup = new Set(itemsPopup.map((item) => item.id));

    // Elimina los que ya no están seleccionados
    this.items = this.items.filter((item) => idsPopup.has(item.id));

    // Agrega los nuevos
    for (const nuevo of itemsPopup) {
      const yaExiste = this.items.find((item) => item.id === nuevo.id);
      if (!yaExiste) {
        this.items.push({ ...nuevo });
      }
    }
  }

  async registrarPedido() {
    if (this.registrandoPedido) return;

    // Validación de campos obligatorios
    if (!this.mesaSeleccionada || !this.modalidadSeleccionada) {
      alert(
        'Por favor, selecciona una mesa y una modalidad antes de continuar.'
      );
      return;
    }

    this.registrandoPedido = true;

    const montoTotal = this.items.reduce((acc, item) => acc + item.subtotal, 0);
    const exito = await this.registrarPedidosService.agregarPedidoConDetalles(
      this.mesaSeleccionada.idMesa,
      this.modalidadSeleccionada.idModalidad,
      montoTotal,
      false,
      this.items
    );

    if (exito) {
      alert('Pedido registrado correctamente');
      await this.limpiarVentana();
    } else {
      alert('Ocurrió un error al registrar el pedido');
    }

    this.registrandoPedido = false; // Asegúrate de volver a habilitar el botón
  }

  eliminarItem(item: any) {
    this.items = this.items.filter((i) => i !== item);
  }

  incrementarCantidad(item: any) {
    item.cantidad ??= 0;
    item.cantidad++;
  }

  actualizarCantidad(item: any, delta: number) {
    item.cantidad = Math.max(1, item.cantidad + delta);
    item.subtotal = item.cantidad * item.precioUnitario;
  }

  limpiarItems() {
    this.items = [];
  }

  async limpiarVentana(): Promise<void> {
    this.items = [];
    this.mesaSeleccionada = null;
    this.modalidadSeleccionada = null;

    try {
      this.mesas = await this.registrarPedidosService.obtenerMesas(); // Actualiza mesas desocupadas
      this.ultimoId =
        await this.registrarPedidosService.obtenerUltimoIdPedido();
      this.nuevoCodigo =
        await this.registrarPedidosService.generarNuevoCodigoPedido();
    } catch (error) {
      console.error('Error al reiniciar datos del pedido:', error);
      this.nuevoCodigo = 'PD-????????';
    }
  }
}
