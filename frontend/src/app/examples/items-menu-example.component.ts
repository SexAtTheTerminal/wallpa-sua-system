import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemsStateService } from '../services/data-access/items-service/items-state.service';

/**
 * EJEMPLO de componente de Menú de Items usando Signals
 *
 * Este componente demuestra cómo usar el ItemsStateService con signals
 * y computed signals avanzados
 */
@Component({
  selector: 'app-items-menu-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="menu-container">
      <h2>Menú del Restaurante</h2>

      <!-- Estadísticas del menú -->
      <div class="stats">
        <div class="stat-card">
          <h4>Total Items</h4>
          <p class="stat-number">{{ itemsState.totalItems() }}</p>
        </div>
        <div class="stat-card">
          <h4>Disponibles</h4>
          <p class="stat-number">{{ itemsState.itemsDisponibles() }}</p>
        </div>
        <div class="stat-card">
          <h4>No Disponibles</h4>
          <p class="stat-number">{{ itemsState.itemsNoDisponibles() }}</p>
        </div>
        <div class="stat-card">
          <h4>Precio Promedio</h4>
          <p class="stat-number">S/. {{ itemsState.precioPromedio().toFixed(2) }}</p>
        </div>
      </div>

      <!-- Items por categoría -->
      <div class="category-stats">
        <h3>Items por Categoría</h3>
        <div class="categories-grid">
          @for (categoria of itemsState.categorias(); track categoria) {
            <div
              class="category-chip"
              [class.selected]="itemsState.selectedCategoria() === categoria"
              (click)="selectCategory(categoria)"
            >
              <span class="category-name">{{ categoria }}</span>
              <span class="category-count">
                {{ itemsState.itemsPorCategoria()[categoria] || 0 }}
              </span>
            </div>
          }
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters">
        <div class="filter-group">
          <label>
            <input
              type="checkbox"
              [checked]="itemsState.showOnlyDisponibles()"
              (change)="toggleDisponibles()"
            />
            Mostrar solo disponibles
          </label>
        </div>

        <div class="filter-group">
          <input
            type="text"
            [value]="itemsState.searchTerm()"
            (input)="onSearchChange($event)"
            placeholder="Buscar platos..."
          />
        </div>

        @if (hasActiveFilters()) {
          <button (click)="clearFilters()" class="clear-btn">
            Limpiar ({{ itemsState.totalItemsFiltrados() }} resultados)
          </button>
        }
      </div>

      <!-- Loading -->
      @if (itemsState.loading()) {
        <div class="loading">
          <div class="spinner"></div>
          Cargando menú...
        </div>
      }

      <!-- Error -->
      @if (itemsState.error()) {
        <div class="error-message">
          {{ itemsState.error() }}
          <button (click)="clearError()">×</button>
        </div>
      }

      <!-- Lista de items -->
      @if (itemsState.hasItems() && !itemsState.loading()) {
        <div class="items-grid">
          @for (item of itemsState.itemsFiltrados(); track item.id) {
            <div class="item-card" [class.unavailable]="!item.disponible">
              <div class="item-header">
                <h3>{{ item.nombre }}</h3>
                @if (!item.disponible) {
                  <span class="badge-unavailable">No disponible</span>
                }
              </div>

              <p class="item-description">{{ item.descripcion || 'Sin descripción' }}</p>

              <div class="item-footer">
                <span class="item-category">{{ item.categoria }}</span>
                <span class="item-price">S/. {{ item.precio.toFixed(2) }}</span>
              </div>
            </div>
          } @empty {
            <div class="no-results">
              No se encontraron items con los filtros aplicados
            </div>
          }
        </div>

        <!-- Información adicional con computed -->
        <div class="additional-info">
          <div class="info-section">
            <h3>Top 5 Más Caros</h3>
            <ul>
              @for (item of itemsState.itemsMasCaros(); track item.id) {
                <li>
                  {{ item.nombre }} - S/. {{ item.precio.toFixed(2) }}
                </li>
              }
            </ul>
          </div>

          <div class="info-section">
            <h3>Top 5 Más Económicos</h3>
            <ul>
              @for (item of itemsState.itemsMasBaratos(); track item.id) {
                <li>
                  {{ item.nombre }} - S/. {{ item.precio.toFixed(2) }}
                </li>
              }
            </ul>
          </div>
        </div>
      } @else if (!itemsState.loading()) {
        <div class="no-items">
          <p>No hay items en el menú</p>
          <button (click)="reloadItems()" class="reload-btn">
            Cargar Menú
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .menu-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .stat-card {
      padding: 20px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .stat-card h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .stat-number {
      font-size: 28px;
      font-weight: bold;
      margin: 0;
    }

    .category-stats {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .categories-grid {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 15px;
    }

    .category-chip {
      padding: 10px 15px;
      background: #f5f5f5;
      border-radius: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
    }

    .category-chip:hover {
      background: #e0e0e0;
    }

    .category-chip.selected {
      background: #2196f3;
      color: white;
    }

    .category-count {
      background: rgba(0,0,0,0.1);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: bold;
    }

    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-group {
      flex: 1;
      min-width: 200px;
    }

    .filter-group input[type="text"] {
      width: 100%;
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
    }

    .clear-btn {
      padding: 10px 20px;
      background: #ff9800;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #2196f3;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .item-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .item-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .item-card.unavailable {
      opacity: 0.6;
      background: #f9f9f9;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 10px;
    }

    .item-header h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
    }

    .badge-unavailable {
      background: #f44336;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
    }

    .item-description {
      color: #666;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 15px;
    }

    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .item-category {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }

    .item-price {
      font-size: 20px;
      font-weight: bold;
      color: #4caf50;
    }

    .additional-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }

    .info-section {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .info-section h3 {
      margin-top: 0;
      color: #333;
    }

    .info-section ul {
      list-style: none;
      padding: 0;
    }

    .info-section li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .info-section li:last-child {
      border-bottom: none;
    }

    .no-results,
    .no-items {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .reload-btn {
      margin-top: 20px;
      padding: 12px 24px;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    }
  `]
})
export class ItemsMenuExampleComponent {
  readonly itemsState = inject(ItemsStateService);

  // Computed signal local
  readonly hasActiveFilters = computed(() =>
    !!this.itemsState.searchTerm() ||
    !!this.itemsState.selectedCategoria() ||
    !this.itemsState.showOnlyDisponibles()
  );

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.itemsState.setSearchTerm(input.value);
  }

  selectCategory(categoria: string): void {
    // Si ya está seleccionada, deseleccionar
    if (this.itemsState.selectedCategoria() === categoria) {
      this.itemsState.setCategoriaFilter(null);
    } else {
      this.itemsState.setCategoriaFilter(categoria);
    }
  }

  toggleDisponibles(): void {
    this.itemsState.toggleShowOnlyDisponibles();
  }

  clearFilters(): void {
    this.itemsState.clearFilters();
  }

  clearError(): void {
    this.itemsState.clearError();
  }

  reloadItems(): void {
    this.itemsState.loadItems();
  }
}
