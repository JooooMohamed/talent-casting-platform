import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile, ParseFilePipe,
  MaxFileSizeValidator, FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { TalentService } from './talent.service';
import { MediaService } from '../media/media.service';
import { CreateTalentProfileDto } from './dto/create-talent-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, TalentFilters, CLOUDINARY_FOLDERS } from '@talent-casting/shared';
import { multerConfig } from '../../config/multer.config';
import { MediaAssetDto, PortfolioMediaAssetDto } from './dto/media-asset.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@ApiTags('Talents')
@Controller('talents')
export class TalentController {
  constructor(
    private talentService: TalentService,
    private mediaService: MediaService,
  ) {}

  // ─── Public Routes ───────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Browse talent marketplace' })
  async browse(@Query() filters: TalentFilters) {
    const result = await this.talentService.browseMarketplace(filters);
    return { success: true, data: result };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get public talent profile by slug' })
  async getProfile(@Param('slug') slug: string) {
    const profile = await this.talentService.getPublicProfile(slug);
    return { success: true, data: profile };
  }

  // ─── Talent Own Routes ───────────────────────────────────────────────────────

  @Get('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  async myProfile(@CurrentUser('_id') userId: string) {
    const profile = await this.talentService.getMyProfile(userId);
    return { success: true, data: profile };
  }

  @Post('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  async upsertProfile(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateTalentProfileDto,
  ) {
    const profile = await this.talentService.createOrUpdateProfile(userId, dto);
    return { success: true, data: profile };
  }

  @Post('me/photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  async uploadPhoto(
    @CurrentUser('_id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpg|jpeg|png|webp)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const asset = await this.mediaService.uploadImage(file, CLOUDINARY_FOLDERS.PROFILE_PHOTOS);
    await this.talentService.updateProfilePhoto(userId, asset);
    return { success: true, data: asset };
  }

  @Put('me/photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  async attachPhoto(
    @CurrentUser('_id') userId: string,
    @Body() asset: MediaAssetDto,
  ) {
    await this.talentService.updateProfilePhoto(userId, asset);
    return { success: true, data: asset };
  }

  @Post('me/videos/intro')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('video', multerConfig))
  async uploadIntroVideo(
    @CurrentUser('_id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 200 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const asset = await this.mediaService.uploadVideo(file, CLOUDINARY_FOLDERS.INTRO_VIDEOS);
    await this.talentService.updateVideo(userId, 'introVideo', asset);
    return { success: true, data: asset };
  }

  @Put('me/videos/intro')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  async attachIntroVideo(
    @CurrentUser('_id') userId: string,
    @Body() asset: MediaAssetDto,
  ) {
    await this.talentService.updateVideo(userId, 'introVideo', asset);
    return { success: true, data: asset };
  }

  @Post('me/videos/scene')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('video', multerConfig))
  async uploadSceneVideo(
    @CurrentUser('_id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 200 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const asset = await this.mediaService.uploadVideo(file, CLOUDINARY_FOLDERS.SCENE_VIDEOS);
    await this.talentService.updateVideo(userId, 'sceneVideo', asset);
    return { success: true, data: asset };
  }

  @Put('me/videos/scene')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  async attachSceneVideo(
    @CurrentUser('_id') userId: string,
    @Body() asset: MediaAssetDto,
  ) {
    await this.talentService.updateVideo(userId, 'sceneVideo', asset);
    return { success: true, data: asset };
  }

  @Post('me/videos/portfolio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('video', multerConfig))
  async addPortfolioVideo(
    @CurrentUser('_id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
  ) {
    const asset = await this.mediaService.uploadVideo(file, CLOUDINARY_FOLDERS.PORTFOLIO_VIDEOS);
    const profile = await this.talentService.addPortfolioVideo(userId, { ...asset, title });
    return { success: true, data: profile };
  }

  @Post('me/videos/portfolio/attach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  async attachPortfolioVideo(
    @CurrentUser('_id') userId: string,
    @Body() asset: PortfolioMediaAssetDto,
  ) {
    const profile = await this.talentService.addPortfolioVideo(userId, asset);
    return { success: true, data: profile };
  }

  @Delete('me/videos/portfolio/:publicId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  async removePortfolioVideo(
    @CurrentUser('_id') userId: string,
    @Param('publicId') publicId: string,
  ) {
    await Promise.all([
      this.talentService.removePortfolioVideo(userId, publicId),
      this.mediaService.deleteAsset(publicId),
    ]);
    return { success: true, message: 'Video removed' };
  }

  @Put('me/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  async updateAvailability(
    @CurrentUser('_id') userId: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    await this.talentService.updateAvailability(userId, dto.availability);
    return { success: true, message: 'Availability updated' };
  }
}
