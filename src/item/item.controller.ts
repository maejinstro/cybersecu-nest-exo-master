import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ItemService } from './item.service.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('item')
@UseGuards(JwtAuthGuard)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  create(@Body() createItemDto: CreateItemDto, @Req() req: Request) {
    return this.itemService.create(createItemDto, req.user!.sub);
  }

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto, @Req() req: Request) {
    await this.checkOwnership(+id, req);
    return this.itemService.update(+id, updateItemDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    await this.checkOwnership(+id, req);
    return this.itemService.remove(+id);
  }

  private async checkOwnership(id: number, req: Request) {
    const item = await this.itemService.findOne(id);
    if (!item) {
      throw new NotFoundException('Item introuvable');
    }
    const isOwner = item.userId === req.user!.sub;
    const isAdmin = req.user!.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException("Vous n'avez pas le droit de modifier cet item");
    }
  }
}
