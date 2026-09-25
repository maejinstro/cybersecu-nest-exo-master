import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ContactService } from './contact.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';

// Le contrôleur reçoit les requêtes et délègue le traitement au service.
// Source : https://docs.nestjs.com/controllers
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // POST /contact : créer un contact.
  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  // GET /contact : récupérer les contacts.
  @Get()
  findAll() {
    return this.contactService.findAll();
  }

  // ParseIntPipe convertit l'identifiant en entier et refuse les valeurs invalides.
  // Source : https://docs.nestjs.com/pipes
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.findOne(id);
  }

  // PATCH /contact/:id : modifier les champs transmis.
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactService.update(id, updateContactDto);
  }

  // DELETE /contact/:id : supprimer un contact.
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.remove(id);
  }
}