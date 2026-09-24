import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { Item } from './entities/item.entity.js';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  create(createItemDto: CreateItemDto, userId: number) {
    return this.itemRepository.save({ ...createItemDto, userId });
  }

  findAll() {
    return this.itemRepository.find({ relations: { user: true }, order: { createdAt: 'DESC' } });
  }

  findOne(id: number) {
    return this.itemRepository.findOne({ where: { id }, relations: { user: true } });
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    await this.itemRepository.update(id, updateItemDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.itemRepository.delete(id);
  }
}
