import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Contact } from './entities/contact.entity.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  create(createContactDto: CreateContactDto) {
    return this.contactRepository.save({
      ...createContactDto,
    });
  }

  findAll() {
    return this.contactRepository.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.contactRepository.findOne({
      where: { id },
      relations: { user: true },
    });
  }

  async update(id: number, updateContactDto: UpdateContactDto) {
    await this.contactRepository.update(id, updateContactDto);
    return this.findOne(id);
  }
  
  remove(id: number) {
  return this.contactRepository.delete(id);
}
}