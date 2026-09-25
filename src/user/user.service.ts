import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
  // Sélectionne les champs autorisés à l'inscription.
  // Le rôle est imposé côté serveur : le client ne peut pas choisir "admin".
  const user = this.userRepository.create({
    username: createUserDto.username,
    email: createUserDto.email,
    password: createUserDto.password,
    role: 'user',
  });

  // Enregistre l'entité et retourne notamment son identifiant généré.
  return this.userRepository.save(user);
}
  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOne({ where: { id }, relations: { items: true } });
  }

  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
}
