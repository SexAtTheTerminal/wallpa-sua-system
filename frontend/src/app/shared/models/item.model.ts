export interface Item {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  disponible: boolean;
  fechaCreacion: Date;
}

export interface CreateItemDto {
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  disponible?: boolean;
}

export interface UpdateItemDto {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  categoria?: string;
  disponible?: boolean;
}
