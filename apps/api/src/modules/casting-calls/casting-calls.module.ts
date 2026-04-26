import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CastingCall, CastingCallSchema } from './schemas/casting-call.schema';
import { CastingCallsService } from './casting-calls.service';
import { CastingCallsController } from './casting-calls.controller';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CastingCall.name, schema: CastingCallSchema }]),
    ApplicationsModule,
  ],
  controllers: [CastingCallsController],
  providers: [CastingCallsService],
  exports: [CastingCallsService],
})
export class CastingCallsModule {}
