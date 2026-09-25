import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupportMessageDto } from './dto/create-support-message.dto.js';
import { SupportMessage } from './entities/support-message.entity.js';

@Injectable()
export class SupportMessageService {
  constructor(
    @InjectRepository(SupportMessage)
    private readonly supportMessageRepository: Repository<SupportMessage>,
  ) {}

  create(createSupportMessageDto: CreateSupportMessageDto, userId: number) {
    return this.supportMessageRepository.save({ ...createSupportMessageDto, userId });
  }

  findAll() {
    return this.supportMessageRepository.find({ relations: { user: true }, order: { createdAt: 'DESC' } });
  }

  findOne(id: number) {
    return this.supportMessageRepository.findOne({ where: { id }, relations: { user: true } });
  }
}
