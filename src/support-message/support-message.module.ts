import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportMessageService } from './support-message.service.js';
import { SupportMessage } from './entities/support-message.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([SupportMessage]), AuthModule],
  providers: [SupportMessageService],
})
export class SupportMessageModule {}
