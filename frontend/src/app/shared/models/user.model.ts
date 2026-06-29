export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rolId: number;
  activo: boolean;
  fechaRegistro: Date;
  rol?: Rol;
}

export interface Rol {
  id: number;
  nombre: 'admin' | 'cashier' | 'cooker' | 'waiter';
  descripcion?: string;
  fechaCreacion: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: 'admin' | 'cashier' | 'cooker' | 'waiter';
  };
}

export interface CreateUsuarioDto {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rolId: number;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  rolId?: number;
  activo?: boolean;
}
