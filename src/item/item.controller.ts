import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ItemService } from './item.service.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Throttle({
  default: {
    limit: 10, //nombre de requêtes autorisées
    ttl: 60000,//exprimer en milisecondes, donc 60000 = 1 minute
  },
})
  @Post()
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(+id);
  }

  @Throttle({
  default: {
    limit: 20,
    ttl: 60000,
  },
})

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(+id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(+id);
  }
}
