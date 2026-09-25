import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service.js';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import bcrypt from 'bcrypt';



@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  

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
    
        const access_token = await this.jwtService.signAsync({ sub: user.id, role: user.role });
    return { access_token, user };
  }
}
