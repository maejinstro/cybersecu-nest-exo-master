import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ItemModule } from './item/item.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Charge .env et rend ConfigService accessible dans les autres modules.
// Source : https://docs.nestjs.com/techniques/configuration
ConfigModule.forRoot({
  isGlobal: true,
}),

// Chaque membre du groupe utilise ses propres identifiants PostgreSQL locaux.
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    // getOrThrow signale immédiatement une variable obligatoire absente.
    host: configService.getOrThrow<string>('DB_HOST'),
    // Les variables d'environnement sont des chaînes : conversion du port.
    port: Number(configService.getOrThrow<string>('DB_PORT')),
    username: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_DATABASE'),
    autoLoadEntities: true,
    // Synchronisation des tables pour l'exercice local, pas pour la production.
    synchronize: true,
  }),
}),
    UserModule,
    AuthModule,
    ItemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
