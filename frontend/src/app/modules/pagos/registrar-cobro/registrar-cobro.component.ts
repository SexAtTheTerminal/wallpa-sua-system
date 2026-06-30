import { Component, inject } from '@angular/core';
import { SidebarCasherComponent } from '../../../sidebar/features/sidebar-casher/sidebar-casher.component';
import { NgClass, NgIf, CommonModule } from '@angular/common';
import { ApiPeruService } from '../../../shared/data-access/api-peru.service';
import { catchError, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RegistrarCobroService } from '../../../services/data-access/registrar-cobro/registrar-cobro.service';

@Component({
  selector: 'app-registrar-cobro',
  imports: [SidebarCasherComponent, NgClass, FormsModule, CommonModule, NgIf],
  templateUrl: './registrar-cobro.component.html',
  styleUrl: './registrar-cobro.component.scss',
})
export class RegistrarCobroComponent {
  totalPaginas: number = 0;
  sidebarCollapsed = false;
  dni: string = '';
  clienteNombres: string = '';
  clienteCompleto: any = null;
  loading: boolean = false;
  error: string | null = null;
  mesas: any[] = [];
  mesaSeleccionada: { idMesa: number; numeroMesa: string } | null = null;
  pedidoSeleccionado: { nombre: string; cantidad: number; precio: number }[] =
    [];
  totalPedido: number = 0;
  mensajeError: string | null = null;
  datosAregistrar: { idPedido: number; idModalidad: number } | null = null;
  paginaActual: number = 0;
  botonUnico: boolean = false;
  tiposPago: { id: number; nombre: string }[] = [];
  tipoPagoSeleccionado: { id: number; nombre: string } | null = null;

  private readonly registrarCobroService = inject(RegistrarCobroService);

  constructor(private readonly apiPeruService: ApiPeruService) {}

  onSidebarToggle(state: boolean): void {
    this.sidebarCollapsed = state;
  }

  onTipoPagoChange(tipo: { id: number; nombre: string } | null): void {
    console.log('Tipo de pago seleccionado:', tipo);
    this.tipoPagoSeleccionado = tipo;
  }

  async ngOnInit() {
    // La verificación de autenticación la manejan los guards de Angular
    this.mesas = await this.registrarCobroService.obtenerMesas();

    // Inicializar tipos de pago
    this.tiposPago = await this.registrarCobroService.obtenerTiposPago();
    console.log('Tipos de pago cargados:', this.tiposPago);
  }

  // DNI API

  async buscarClientePorDni(): Promise<void> {
    this.clienteNombres = '';
    this.error = null;

    if (!this.dni) {
      this.error = 'Por favor, ingrese un número de DNI correcto';
      return;
    }

    if (!/^\d{8}$/.test(this.dni)) {
      this.error = 'El DNI debe ser numérico y tener 8 dígitos';
      return;
    }

    this.loading = true;

    try {
      const clienteExistente: any =
        await this.registrarCobroService.verificarClienteExiste(this.dni);

      if (clienteExistente) {
        this.clienteCompleto = clienteExistente;
        this.clienteNombres = `${clienteExistente.nombreCliente} ${
          clienteExistente.apellPaterno
        } ${clienteExistente.apellMaterno || ''}`;
        this.loading = false;
        console.log('Cliente encontrado en la base de datos');
        return;
      }

      this.apiPeruService
        .buscarPorDni(this.dni)
        .pipe(
          catchError((err) => {
            this.loading = false;
            this.error = 'Error al buscar el DNI. Por favor, intente de nuevo';
            console.error('Error en la llamada a la API:', err);
            return throwError(() => new Error('Error al buscar DNI'));
          })
        )
        .subscribe(async (response) => {
          this.loading = false;

          if (response && response.success && response.data) {
            const apiData = response.data;

            try {
              const clienteParaGuardar = {
                dni: this.dni,
                nombres: apiData.nombres,
                apellido_paterno: apiData.apellido_paterno,
                apellido_materno: apiData.apellido_materno || '',
              };

              const clienteGuardado =
                await this.registrarCobroService.guardarCliente(
                  clienteParaGuardar
                );

              if (clienteGuardado && Array.isArray(clienteGuardado)) {
                this.clienteCompleto = clienteGuardado[0];
                this.clienteNombres = `${apiData.nombres} ${
                  apiData.apellido_paterno
                } ${apiData.apellido_materno || ''}`;
                this.error = null;

                console.log('Cliente guardado en base de datos');
                alert('Cliente registrado exitosamente');
              } else {
                // Servicio no implementado aún, usar datos de la API
                this.clienteCompleto = clienteParaGuardar;
                this.clienteNombres = `${apiData.nombres} ${
                  apiData.apellido_paterno
                } ${apiData.apellido_materno || ''}`;
                this.error = null;
                console.warn('Servicio guardarCliente no implementado - usando datos temporales');
              }
            } catch (supabaseError) {
              console.error('Error al guardar en Supabase:', supabaseError);
              this.error = 'Error al guardar cliente en la base de datos';
            }
          } else {
            this.error = 'No se encontró información para el DNI proporcionado';
            this.clienteNombres = '';
          }
        });
    } catch (error) {
      this.loading = false;
      this.error = 'Error al verificar cliente';
      console.error('Error:', error);
    }
  }

  async mostrarPedidosMesas(
    mesaSeleccionada: { idMesa: number; numeroMesa: string } | null,
    nPedido: number
  ): Promise<void> {
    if (!mesaSeleccionada) return;

    try {
      const resultado = await this.registrarCobroService.obtenerPedidosdelaMesa(
        mesaSeleccionada.idMesa
      );

      this.pedidoSeleccionado = resultado?.[nPedido] || [];
      this.totalPedido = this.pedidoSeleccionado.reduce(
        (total, item) => total + (item.cantidad * item.precio || 0),
        0
      );
      this.paginaActual = nPedido + 1;
      this.totalPaginas = resultado.length;

      console.log('Pedido seleccionado:', this.pedidoSeleccionado);
    } catch (error) {
      console.error('Error al mostrar pedidos:', error);
      this.pedidoSeleccionado = [];
    }
  }

  async registrarPago(
    mesaSeleccionada: { idMesa: number; numeroMesa: string } | null,
    montoTotal: number,
    dniCliente: string
  ) {
    this.botonUnico = true;
    if (!mesaSeleccionada) {
      this.mensajeError = 'Debe seleccionar una mesa.';
      return;
    }

    if (!this.tipoPagoSeleccionado) {
      this.mensajeError = 'Debe seleccionar un tipo de pago.';
      this.botonUnico = false;
      return;
    }

    try {
      const resultado = await this.registrarCobroService.obtenerIds(
        mesaSeleccionada.idMesa
      );
      this.datosAregistrar = resultado?.[this.paginaActual - 1] || null;
      console.log('Ids a registrar', this.datosAregistrar);
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return;
    }

    try {
      if (this.datosAregistrar) {
        const pagoData = {
          pedido_id: this.datosAregistrar.idPedido,
          modalidad_id: this.datosAregistrar.idModalidad,
          monto_total: montoTotal,
          dni_cliente: dniCliente,
          tipo_pago_id: this.tipoPagoSeleccionado.id, // Usar el ID del tipo de pago seleccionado
        };

        console.log('Registrando pago en Supabase:', pagoData);
        await this.registrarCobroService.registrarPago(pagoData); // Registra el pago
        await this.registrarCobroService.actualizarEstadoMesa(
          mesaSeleccionada.idMesa
        ); // Cambia la mesa de ocupada a desocupada
        await this.registrarCobroService.actualizarEstadoPedido(
          pagoData.pedido_id
        ); // Cambia el estado del pedido de no pagado a pagado
        console.log('Pago registrado en Supabase correctamente');
      } else {
        this.mensajeError = 'No hay pedidos para registrar.';
        return;
      }
    } catch (error) {
      console.error('Error al registrar cobro', error);
      this.mensajeError = 'Error al registrar el pago: ' + error;
      return;
    }

    alert('Pedido registrado correctamente');
    window.location.reload();
    return;
  }

  paginaAnterior(
    mesaSeleccionada: { idMesa: number; numeroMesa: string } | null
  ) {
    if (this.paginaActual === 1) return;

    this.paginaActual = this.paginaActual - 1;
    this.mostrarPedidosMesas(mesaSeleccionada, this.paginaActual - 1);
  }

  paginaSiguiente(
    mesaSeleccionada: { idMesa: number; numeroMesa: string } | null
  ) {
    if (this.paginaActual === this.totalPaginas) return;

    this.paginaActual = this.paginaActual + 1;
    this.mostrarPedidosMesas(mesaSeleccionada, this.paginaActual - 1);
  }

  async confirmarPagoConCliente(): Promise<void> {
    if (!this.mesaSeleccionada) {
      this.mensajeError = 'Debe seleccionar una mesa.';
      return;
    }

    if (!this.clienteCompleto) {
      this.mensajeError = 'Debe buscar un cliente primero.';
      return;
    }
    if (!this.tipoPagoSeleccionado) {
      this.mensajeError = 'Debe seleccionar un tipo de pago.';
      return;
    }

    await this.registrarPago(this.mesaSeleccionada, this.totalPedido, this.dni);
  }
}
