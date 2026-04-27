import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum UploadPurpose {
  PROFILE_PHOTO = 'profile_photo',
  INTRO_VIDEO = 'intro_video',
  SCENE_VIDEO = 'scene_video',
  PORTFOLIO_VIDEO = 'portfolio_video',
  COMPANY_LOGO = 'company_logo',
}

export class CreateUploadSignatureDto {
  @ApiProperty({ enum: UploadPurpose })
  @IsEnum(UploadPurpose)
  purpose: UploadPurpose;
}
