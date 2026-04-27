import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TalentProfile, TalentProfileSchema } from '../talent/schemas/talent-profile.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { ContactRequest, ContactRequestSchema } from './schemas/contact-request.schema';
import { ContactRequestsController } from './contact-requests.controller';
import { ContactRequestsService } from './contact-requests.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactRequest.name, schema: ContactRequestSchema },
      { name: TalentProfile.name, schema: TalentProfileSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [ContactRequestsController],
  providers: [ContactRequestsService],
  exports: [ContactRequestsService],
})
export class ContactRequestsModule {}
