import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@talent-casting/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ContactRequestsService } from './contact-requests.service';
import { CreateContactRequestDto, UpdateContactRequestStatusDto } from './dto/contact-request.dto';

@ApiTags('Contact Requests')
@Controller('contact-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContactRequestsController {
  constructor(private contactRequestsService: ContactRequestsService) {}

  @Post('talents/:talentProfileId')
  @Roles(UserRole.CASTING)
  @ApiOperation({ summary: 'Request contact with a talent' })
  async create(
    @CurrentUser('_id') userId: string,
    @CurrentUser('email') email: string,
    @Param('talentProfileId') talentProfileId: string,
    @Body() dto: CreateContactRequestDto,
  ) {
    const request = await this.contactRequestsService.create(userId, email, talentProfileId, dto);
    return { success: true, data: request };
  }

  @Get('sent')
  @Roles(UserRole.CASTING)
  async sent(
    @CurrentUser('_id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.contactRequestsService.findSent(userId, +page, +limit);
    return { success: true, data: result };
  }

  @Get('received')
  @Roles(UserRole.TALENT)
  async received(
    @CurrentUser('_id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.contactRequestsService.findReceived(userId, +page, +limit);
    return { success: true, data: result };
  }

  @Put(':id/status')
  @Roles(UserRole.TALENT)
  async updateStatus(
    @CurrentUser('_id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContactRequestStatusDto,
  ) {
    const request = await this.contactRequestsService.updateStatus(
      userId,
      id,
      dto.status,
      dto.responseMessage,
    );
    return { success: true, data: request };
  }
}
