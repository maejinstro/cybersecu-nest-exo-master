import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js';
import { jwtConstants } from './constants.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

// Configuration JWT adaptée de la documentation officielle :
// https://github.com/nestjs/jwt#async-options
@Module({
  imports: [
    UserModule,
    // La factory récupère le secret depuis la configuration de l'application.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Le secret reste dans .env. Son absence empêche le démarrage.
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          // Chaque token expire 15 minutes après sa création.
          expiresIn: '15m',
        },
      }),
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}