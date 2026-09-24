import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  register(registerAuthDto: RegisterAuthDto) {
    return this.userService.create(registerAuthDto);
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.userService.findByEmail(loginAuthDto.email);
    if (!user || user.password !== loginAuthDto.password) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    return user;
  }
}
