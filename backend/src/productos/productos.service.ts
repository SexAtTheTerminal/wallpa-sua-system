import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../entities/item.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  async findAll(): Promise<Item[]> {
    return this.itemRepository.find({
      where: { disponible: true },
      order: { nombre: 'ASC' },
    });
  }

  async findById(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return item;
  }

  async findByCategoria(categoria: string): Promise<Item[]> {
    return this.itemRepository.find({
      where: { categoria, disponible: true },
      order: { nombre: 'ASC' },
    });
  }

  async create(createProductoDto: CreateProductoDto): Promise<Item> {
    const item = this.itemRepository.create({
      ...createProductoDto,
      disponible: createProductoDto.disponible ?? true,
    });
    return this.itemRepository.save(item);
  }

  async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Item> {
    const item = await this.findById(id);
    Object.assign(item, updateProductoDto);
    return this.itemRepository.save(item);
  }

  async remove(id: number): Promise<{ message: string }> {
    const item = await this.findById(id);
    await this.itemRepository.remove(item);
    return { message: 'Producto eliminado correctamente' };
  }

  async getCategorias(): Promise<string[]> {
    const result = await this.itemRepository
      .createQueryBuilder('item')
      .select('DISTINCT item.categoria', 'categoria')
      .orderBy('item.categoria', 'ASC')
      .getRawMany();
    return result.map((r) => r.categoria);
  }
}
