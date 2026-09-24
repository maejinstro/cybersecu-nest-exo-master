import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service.js';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  register(registerAuthDto: RegisterAuthDto) {
    return this.userService.create(registerAuthDto);
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.userService.findByEmail(loginAuthDto.email);
    if (!user || !(await bcrypt.compare(loginAuthDto.password, user.password))) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    const access_token = await this.jwtService.signAsync({ sub: user.id, role: user.role });
    return { access_token, user };
  }
}
