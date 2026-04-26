import { Controller, Get, Put, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @CurrentUser('_id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.notificationsService.findForUser(userId, +page, +limit);
    return { success: true, data: result };
  }

  @Put(':id/read')
  async markRead(@Param('id') id: string, @CurrentUser('_id') userId: string) {
    await this.notificationsService.markRead(id, userId);
    return { success: true };
  }

  @Put('read-all')
  async markAllRead(@CurrentUser('_id') userId: string) {
    await this.notificationsService.markAllRead(userId);
    return { success: true };
  }
}
