import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemService } from './item.service.js';
import { ItemController } from './item.controller.js';
import { Item } from './entities/item.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Item]), AuthModule],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
