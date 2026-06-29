import { Injectable, inject, signal, computed } from '@angular/core';
import { ItemsService } from './items.service';
import { Item } from '../../../shared/models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemsStateService {
  private readonly itemsService = inject(ItemsService);

  // Signals para estado
  private readonly _items = signal<Item[]>([]);
  private readonly _categorias = signal<string[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchTerm = signal<string>('');
  private readonly _selectedCategoria = signal<string | null>(null);
  private readonly _showOnlyDisponibles = signal<boolean>(true);

  // Signals públicos (readonly)
  readonly items = this._items.asReadonly();
  readonly categorias = this._categorias.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly selectedCategoria = this._selectedCategoria.asReadonly();
  readonly showOnlyDisponibles = this._showOnlyDisponibles.asReadonly();

  // Computed signals
  readonly itemsFiltrados = computed(() => {
    const items = this._items();
    const search = this._searchTerm().toLowerCase();
    const categoriaFilter = this._selectedCategoria();
    const onlyDisponibles = this._showOnlyDisponibles();

    let filtered = items;

    // Filtrar por disponibilidad
    if (onlyDisponibles) {
      filtered = filtered.filter(i => i.disponible);
    }

    // Filtrar por búsqueda
    if (search) {
      filtered = filtered.filter(i =>
        i.nombre.toLowerCase().includes(search) ||
        i.descripcion?.toLowerCase().includes(search)
      );
    }

    // Filtrar por categoría
    if (categoriaFilter) {
      filtered = filtered.filter(i => i.categoria === categoriaFilter);
    }

    return filtered;
  });

  readonly totalItems = computed(() => this._items().length);
  readonly totalItemsFiltrados = computed(() => this.itemsFiltrados().length);
  readonly itemsDisponibles = computed(() => this._items().filter(i => i.disponible).length);
  readonly itemsNoDisponibles = computed(() => this._items().filter(i => !i.disponible).length);

  readonly hasItems = computed(() => this._items().length > 0);
  readonly hasError = computed(() => this._error() !== null);

  // Precio promedio
  readonly precioPromedio = computed(() => {
    const items = this._items();
    if (items.length === 0) return 0;
    const total = items.reduce((sum, item) => sum + item.precio, 0);
    return total / items.length;
  });

  // Items por categoría
  readonly itemsPorCategoria = computed(() => {
    const items = this._items();
    const stats: Record<string, number> = {};

    items.forEach(i => {
      stats[i.categoria] = (stats[i.categoria] || 0) + 1;
    });

    return stats;
  });

  // Items más caros
  readonly itemsMasCaros = computed(() => {
    return [...this._items()]
      .sort((a, b) => b.precio - a.precio)
      .slice(0, 5);
  });

  // Items más baratos
  readonly itemsMasBaratos = computed(() => {
    return [...this._items()]
      .sort((a, b) => a.precio - b.precio)
      .slice(0, 5);
  });

  constructor() {
    // Cargar datos iniciales
    this.loadItems();
    this.loadCategorias();
  }

  /**
   * Cargar items desde el API
   */
  loadItems(): void {
    this._loading.set(true);
    this._error.set(null);

    this.itemsService.findAll().subscribe({
      next: (items) => {
        this._items.set(items);
        this._loading.set(false);
      },
      error: (error) => {
        this._error.set(error.message || 'Error al cargar items');
        this._loading.set(false);
        console.error('Error cargando items:', error);
      }
    });
  }

  /**
   * Cargar categorías desde el API
   */
  loadCategorias(): void {
    this.itemsService.getCategorias().subscribe({
      next: (categorias) => {
        this._categorias.set(categorias);
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
      }
    });
  }

  /**
   * Crear un nuevo item
   */
  createItem(itemData: any): void {
    this._loading.set(true);
    this._error.set(null);

    this.itemsService.create(itemData).subscribe({
      next: (nuevoItem) => {
        // Agregar el nuevo item a la lista
        this._items.update(items => [...items, nuevoItem]);
        this._loading.set(false);
        // Recargar categorías por si se agregó una nueva
        this.loadCategorias();
      },
      error: (error) => {
        this._error.set(error.message || 'Error al crear item');
        this._loading.set(false);
        console.error('Error creando item:', error);
      }
    });
  }

  /**
   * Actualizar un item existente
   */
  updateItem(id: number, itemData: any): void {
    this._loading.set(true);
    this._error.set(null);

    this.itemsService.update(id, itemData).subscribe({
      next: (itemActualizado) => {
        // Actualizar el item en la lista
        this._items.update(items =>
          items.map(i => i.id === id ? itemActualizado : i)
        );
        this._loading.set(false);
      },
      error: (error) => {
        this._error.set(error.message || 'Error al actualizar item');
        this._loading.set(false);
        console.error('Error actualizando item:', error);
      }
    });
  }

  /**
   * Eliminar un item
   */
  deleteItem(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.itemsService.remove(id).subscribe({
      next: () => {
        // Remover el item de la lista
        this._items.update(items => items.filter(i => i.id !== id));
        this._loading.set(false);
      },
      error: (error) => {
        this._error.set(error.message || 'Error al eliminar item');
        this._loading.set(false);
        console.error('Error eliminando item:', error);
      }
    });
  }

  /**
   * Establecer término de búsqueda
   */
  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  /**
   * Establecer filtro de categoría
   */
  setCategoriaFilter(categoria: string | null): void {
    this._selectedCategoria.set(categoria);
  }

  /**
   * Alternar mostrar solo disponibles
   */
  toggleShowOnlyDisponibles(): void {
    this._showOnlyDisponibles.update(current => !current);
  }

  /**
   * Establecer mostrar solo disponibles
   */
  setShowOnlyDisponibles(value: boolean): void {
    this._showOnlyDisponibles.set(value);
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this._searchTerm.set('');
    this._selectedCategoria.set(null);
    this._showOnlyDisponibles.set(true);
  }

  /**
   * Limpiar error
   */
  clearError(): void {
    this._error.set(null);
  }
}
