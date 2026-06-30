import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegistrarPedidosService } from '../../../services/data-access/registrar-pedidos/registrar-pedidos.service';

@Component({
  selector: 'app-item-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-search.component.html',
  styleUrl: './item-search.component.scss',
})
export class ItemSearchComponent implements OnInit {
  // Filtros
  private _searchTerm = '';
  selectedCategory = '';
  categorias: string[] = [];

  // Búsqueda reactiva
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.currentPage = 1; // reiniciar al buscar
  }

  // Listado
  items: any[] = [];

  //Cerrado
  cerrando = false;

  // Eventos
  @Output() close = new EventEmitter<void>();
  @Output() itemSelected = new EventEmitter<any>(); // Un solo ítem (clic)
  @Output() itemsSeleccionados = new EventEmitter<any[]>(); // Varios ítems (checkbox)
  @Input() itemsYaSeleccionados: any[] = [];
  @ViewChild('modalContent', { static: true }) modalContentRef!: ElementRef;

  // Paginación
  pageSize = 6;
  currentPage = 1;

  constructor(
    private readonly registrarPedidosService: RegistrarPedidosService
  ) {}

  ngOnInit(): void {
    this.registrarPedidosService.obtenerProductosDesdeDB().then((items: any[]) => {
      this.items = items;

      // Marcar como seleccionados los que ya están en la tabla
      this.items.forEach((item) => {
        item.seleccionado = this.itemsYaSeleccionados.some(
          (ya) => ya.id === item.id
        );
      });

      // Cargar categorías únicas
      const categoriasSet = new Set(this.items.map((item) => item.tipo));
      this.categorias = Array.from(categoriasSet);
    });
  }

  // Filtro sin paginar (para calcular totalPages)
  get filteredItemsRaw() {
    return this.items.filter(
      (item) =>
        item.descripcion
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) &&
        (this.selectedCategory ? item.tipo === this.selectedCategory : true)
    );
  }

  // Ítems de la página actual
  get paginatedItems() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredItemsRaw.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredItemsRaw.length / this.pageSize);
  }

  // Selección de ítems
  toggleSeleccion(item: any) {
    item.seleccionado = !item.seleccionado;
  }

  seleccionar(item: any) {
    this.itemSelected.emit(item); // Clic directo sobre un ítem
  }

  agregarSeleccionados() {
    const seleccionados = this.items.filter((item) => item.seleccionado);
    this.itemsSeleccionados.emit(seleccionados); // Emitir todos los seleccionados
  }

  salir() {
    this.cerrando = true; // activa animación de salida
    setTimeout(() => {
      this.close.emit(); // cierra visualmente tras la animación
    }, 200); // mismo tiempo que la animación
  }

  cambiarCategoria(categoria: string) {
    this.selectedCategory =
      this.selectedCategory === categoria ? '' : categoria;
    this.currentPage = 1; // reiniciar al cambiar filtro
  }

  // Navegación de páginas
  irPaginaAnterior() {
    if (this.currentPage > 1) this.currentPage--;
  }

  irPaginaSiguiente() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onBackdropClick(event: MouseEvent) {
    const clickedInside = this.modalContentRef.nativeElement.contains(
      event.target
    );
    if (!clickedInside) {
      this.agregarSeleccionados();
      this.salir();
    }
  }
}
