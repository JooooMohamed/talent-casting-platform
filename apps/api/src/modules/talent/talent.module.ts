import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TalentProfile, TalentProfileSchema } from './schemas/talent-profile.schema';
import { TalentService } from './talent.service';
import { TalentController } from './talent.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TalentProfile.name, schema: TalentProfileSchema }]),
    MediaModule,
  ],
  controllers: [TalentController],
  providers: [TalentService],
  exports: [TalentService, MongooseModule],
})
export class TalentModule {}
