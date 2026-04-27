import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { ApplicationsService } from './applications.service';
import { CastingCall, CastingCallSchema } from '../casting-calls/schemas/casting-call.schema';
import { TalentProfile, TalentProfileSchema } from '../talent/schemas/talent-profile.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      { name: CastingCall.name, schema: CastingCallSchema },
      { name: TalentProfile.name, schema: TalentProfileSchema },
    ]),
    NotificationsModule,
  ],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
