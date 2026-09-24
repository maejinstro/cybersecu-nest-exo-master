import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import bcrypt from 'bcrypt';



@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) { }

  async register(registerAuthDto: RegisterAuthDto) {

    registerAuthDto.password = await bcrypt.hash(registerAuthDto.password, 10)
    
    return this.userService.create(registerAuthDto);
  }


  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.userService.findByEmail(loginAuthDto.email);


    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (await bcrypt.compare(loginAuthDto.password, user.password)) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    //appel token
  }
}
