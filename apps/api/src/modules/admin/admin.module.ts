import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { TalentModule } from '../talent/talent.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TalentModule, UsersModule],
  controllers: [AdminController],
})
export class AdminModule {}
