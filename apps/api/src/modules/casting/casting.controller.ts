import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CastingService } from './casting.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@talent-casting/shared';
import { CreateCastingProfileDto } from './dto/create-casting-profile.dto';

@ApiTags('Casting')
@Controller('casting')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CASTING)
@ApiBearerAuth()
export class CastingController {
  constructor(private castingService: CastingService) {}

  @Get('me/profile')
  @ApiOperation({ summary: 'Get own casting company profile' })
  async myProfile(@CurrentUser('_id') userId: string) {
    const profile = await this.castingService.getMyProfile(userId);
    return { success: true, data: profile };
  }

  @Post('me/profile')
  @ApiOperation({ summary: 'Create or update casting company profile' })
  async upsertProfile(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateCastingProfileDto,
  ) {
    const profile = await this.castingService.createOrUpdateProfile(userId, dto);
    return { success: true, data: profile };
  }

  @Get('me/saved')
  @ApiOperation({ summary: 'Get saved/favourite talents' })
  async getSaved(@CurrentUser('_id') userId: string) {
    const talents = await this.castingService.getSavedTalents(userId);
    return { success: true, data: talents };
  }

  @Post('me/saved/:talentProfileId')
  @ApiOperation({ summary: 'Save a talent to favourites' })
  async saveTalent(
    @CurrentUser('_id') userId: string,
    @Param('talentProfileId') talentProfileId: string,
  ) {
    await this.castingService.saveTalent(userId, talentProfileId);
    return { success: true, message: 'Talent saved' };
  }

  @Delete('me/saved/:talentProfileId')
  @ApiOperation({ summary: 'Remove talent from favourites' })
  async unsaveTalent(
    @CurrentUser('_id') userId: string,
    @Param('talentProfileId') talentProfileId: string,
  ) {
    await this.castingService.unsaveTalent(userId, talentProfileId);
    return { success: true, message: 'Talent removed from saved' };
  }
}
