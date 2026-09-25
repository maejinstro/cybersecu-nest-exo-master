import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service.js';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import type { User } from '../user/entities/user.entity.js';

// Génération du token adaptée de la documentation officielle :
// https://docs.nestjs.com/security/authentication
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Méthode commune à l'inscription et à la connexion.
  // Pick limite les propriétés nécessaires à l'identifiant et au rôle.
  private async generateToken(user: Pick<User, 'id' | 'role'>) {
    // Le payload est lisible : aucun mot de passe ni secret ne doit y figurer.
    // "sub" identifie l'utilisateur ; le rôle provient des données du serveur.
    const payload = {
      sub: user.id,
      role: user.role,
    };

    return {
      // Signe le token avec la configuration du JwtModule.
      // La bibliothèque ajoute iat et exp pour la création et l'expiration.
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(registerAuthDto: RegisterAuthDto) {
    // Attend l'enregistrement pour disposer de l'identifiant de l'utilisateur.
    const user = await this.userService.create(registerAuthDto);

    return this.generateToken(user);
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.userService.findByEmail(loginAuthDto.email);

    // TODO intégration avec Jean : remplacer la comparaison actuelle
    // par bcrypt.compare(), avec un mot de passe stocké sous forme de hash.
    // Le même message couvre l'email inconnu et le mauvais mot de passe.
    if (!user || user.password !== loginAuthDto.password) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Un token est émis uniquement après vérification des identifiants.
    return this.generateToken(user);
  }
}