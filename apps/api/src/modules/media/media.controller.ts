import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CLOUDINARY_FOLDERS, UserRole } from '@talent-casting/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MediaService } from './media.service';
import { CreateUploadSignatureDto, UploadPurpose } from './dto/create-upload-signature.dto';

const UPLOAD_PURPOSES: Record<UploadPurpose, { folder: string; resourceType: 'image' | 'video' }> = {
  [UploadPurpose.PROFILE_PHOTO]: {
    folder: CLOUDINARY_FOLDERS.PROFILE_PHOTOS,
    resourceType: 'image',
  },
  [UploadPurpose.INTRO_VIDEO]: {
    folder: CLOUDINARY_FOLDERS.INTRO_VIDEOS,
    resourceType: 'video',
  },
  [UploadPurpose.SCENE_VIDEO]: {
    folder: CLOUDINARY_FOLDERS.SCENE_VIDEOS,
    resourceType: 'video',
  },
  [UploadPurpose.PORTFOLIO_VIDEO]: {
    folder: CLOUDINARY_FOLDERS.PORTFOLIO_VIDEOS,
    resourceType: 'video',
  },
  [UploadPurpose.COMPANY_LOGO]: {
    folder: CLOUDINARY_FOLDERS.COMPANY_LOGOS,
    resourceType: 'image',
  },
};

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload-signature')
  @Roles(UserRole.TALENT, UserRole.CASTING)
  @ApiOperation({ summary: 'Create a signed Cloudinary upload payload for direct uploads' })
  async createUploadSignature(@Body() dto: CreateUploadSignatureDto) {
    const purpose = UPLOAD_PURPOSES[dto.purpose];
    const signature = this.mediaService.createUploadSignature(purpose.folder, purpose.resourceType);
    return { success: true, data: signature };
  }
}
