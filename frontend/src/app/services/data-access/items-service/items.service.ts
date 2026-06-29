import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../shared/data-access/api.service';
import { Observable } from 'rxjs';
import { Item, CreateItemDto, UpdateItemDto } from '../../../shared/models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private apiService = inject(ApiService);

  constructor() { }

  /**
   * Obtener todos los items/productos
   */
  findAll(): Observable<Item[]> {
    return this.apiService.get<Item[]>('productos');
  }

  /**
   * Obtener un item por ID
   */
  findById(id: number): Observable<Item> {
    return this.apiService.get<Item>(`productos/${id}`);
  }

  /**
   * Obtener items por categoría
   */
  findByCategoria(categoria: string): Observable<Item[]> {
    return this.apiService.get<Item[]>(`productos/categoria/${categoria}`);
  }

  /**
   * Crear un nuevo item
   */
  create(itemData: CreateItemDto): Observable<Item> {
    return this.apiService.post<Item>('productos', itemData);
  }

  /**
   * Actualizar un item existente
   */
  update(id: number, itemData: UpdateItemDto): Observable<Item> {
    return this.apiService.put<Item>(`productos/${id}`, itemData);
  }

  /**
   * Eliminar un item
   */
  remove(id: number): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`productos/${id}`);
  }

  /**
   * Obtener todas las categorías disponibles
   */
  getCategorias(): Observable<string[]> {
    return this.apiService.get<string[]>('productos/categorias');
  }
}
