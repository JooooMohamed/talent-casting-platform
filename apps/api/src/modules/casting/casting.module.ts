import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CastingProfile, CastingProfileSchema } from './schemas/casting-profile.schema';
import { CastingService } from './casting.service';
import { CastingController } from './casting.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CastingProfile.name, schema: CastingProfileSchema }]),
  ],
  controllers: [CastingController],
  providers: [CastingService],
  exports: [CastingService, MongooseModule],
})
export class CastingModule {}
