import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      relations: ['rol'],
      order: { fechaRegistro: 'DESC' },
    });
  }

  async findById(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['rol'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { email },
      relations: ['rol'],
    });
  }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // Verificar si el email ya existe
    const existingUser = await this.findByEmail(createUsuarioDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar que el rol existe
    const rol = await this.rolRepository.findOne({
      where: { id: createUsuarioDto.rolId },
    });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${createUsuarioDto.rolId} no encontrado`);
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    // Crear usuario
    const usuario = this.usuarioRepository.create({
      nombre: createUsuarioDto.nombre,
      apellido: createUsuarioDto.apellido,
      email: createUsuarioDto.email,
      password: hashedPassword,
      rolId: createUsuarioDto.rolId,
      activo: true,
    });

    return this.usuarioRepository.save(usuario);
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findById(id);

    // Verificar email duplicado si se está actualizando
    if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
      const existingUser = await this.findByEmail(updateUsuarioDto.email);
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Verificar que el rol existe si se está actualizando
    if (updateUsuarioDto.rolId) {
      const rol = await this.rolRepository.findOne({
        where: { id: updateUsuarioDto.rolId },
      });
      if (!rol) {
        throw new NotFoundException(`Rol con ID ${updateUsuarioDto.rolId} no encontrado`);
      }
    }

    // Hash de la contraseña si se está actualizando
    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    // Actualizar usuario
    Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: string): Promise<{ message: string }> {
    const usuario = await this.findById(id);
    await this.usuarioRepository.remove(usuario);
    return { message: 'Usuario eliminado correctamente' };
  }

  async getRoles(): Promise<Rol[]> {
    return this.rolRepository.find({
      order: { id: 'ASC' },
    });
  }
}
