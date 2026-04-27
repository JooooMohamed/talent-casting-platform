import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CastingCallsService } from './casting-calls.service';
import { ApplicationsService } from '../applications/applications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@talent-casting/shared';
import { CreateCastingCallDto, UpdateCastingCallDto } from './dto/casting-call.dto';
import { ApplyToCastingCallDto } from '../applications/dto/apply-to-casting-call.dto';
import { UpdateApplicationStatusDto } from '../applications/dto/update-application-status.dto';

@ApiTags('Casting Calls')
@Controller('casting-calls')
export class CastingCallsController {
  constructor(
    private castingCallsService: CastingCallsService,
    private applicationsService: ApplicationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Browse public casting calls board' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    const result = await this.castingCallsService.findAll(+page, +limit, search);
    return { success: true, data: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get casting call details' })
  async findOne(@Param('id') id: string) {
    const call = await this.castingCallsService.findById(id);
    return { success: true, data: call };
  }

  // Casting user routes
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CASTING)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a casting call' })
  async create(@CurrentUser('_id') userId: string, @Body() dto: CreateCastingCallDto) {
    const call = await this.castingCallsService.create(userId, dto);
    return { success: true, data: call };
  }

  @Get('my/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  async myApplications(
    @CurrentUser('_id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.applicationsService.getMyApplications(userId, +page, +limit);
    return { success: true, data: result };
  }

  @Get('my/calls')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CASTING)
  @ApiBearerAuth()
  async myCalls(
    @CurrentUser('_id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.castingCallsService.findMyCalls(userId, +page, +limit);
    return { success: true, data: result };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CASTING)
  @ApiBearerAuth()
  async update(
    @CurrentUser('_id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCastingCallDto,
  ) {
    const call = await this.castingCallsService.update(userId, id, dto);
    return { success: true, data: call };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CASTING)
  @ApiBearerAuth()
  async delete(@CurrentUser('_id') userId: string, @Param('id') id: string) {
    await this.castingCallsService.delete(userId, id);
    return { success: true, message: 'Casting call deleted' };
  }

  @Post(':id/invite/:talentProfileId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CASTING)
  @ApiBearerAuth()
  async inviteTalent(
    @CurrentUser('_id') userId: string,
    @Param('id') id: string,
    @Param('talentProfileId') talentProfileId: string,
  ) {
    await this.castingCallsService.inviteTalent(userId, id, talentProfileId);
    return { success: true, message: 'Talent invited' };
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CASTING)
  @ApiBearerAuth()
  async getApplications(
    @CurrentUser('_id') userId: string,
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.applicationsService.getByCall(userId, id, +page, +limit);
    return { success: true, data: result };
  }

  @Put(':id/applications/:appId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CASTING)
  @ApiBearerAuth()
  async updateApplication(
    @CurrentUser('_id') userId: string,
    @Param('id') castingCallId: string,
    @Param('appId') appId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    const app = await this.applicationsService.updateStatus(userId, castingCallId, appId, dto.status, dto.notes);
    return { success: true, data: app };
  }

  // Talent routes
  @Post(':id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to a casting call' })
  async apply(
    @CurrentUser('_id') userId: string,
    @Param('id') castingCallId: string,
    @Body() body: ApplyToCastingCallDto,
  ) {
    const app = await this.applicationsService.apply(userId, castingCallId, body.coverMessage);
    return { success: true, data: app };
  }
}
