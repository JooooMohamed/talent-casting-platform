import {
  Controller, Get, Put, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TalentService } from '../talent/talent.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '@talent-casting/shared';
import {
  RejectProfileDto,
  ToggleFeaturedDto,
  ToggleVerifiedDto,
  UpdateUserStatusDto,
} from './dto/admin-actions.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private talentService: TalentService,
    private usersService: UsersService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Platform overview stats' })
  async dashboard() {
    const [talentStats, userStats] = await Promise.all([
      this.talentService.getStats(),
      this.usersService.findAll(1, 1),
    ]);
    return {
      success: true,
      data: {
        talents: talentStats,
        totalUsers: userStats.total,
      },
    };
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async listUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('role') role?: UserRole,
  ) {
    const result = await this.usersService.findAll(+page, +limit, role);
    return { success: true, data: result };
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: 'Update user status (suspend/ban/activate)' })
  async updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    const user = await this.usersService.updateStatus(id, dto.status);
    return { success: true, data: user };
  }

  @Get('talents/pending')
  @ApiOperation({ summary: 'List pending talent profiles awaiting approval' })
  async pendingTalents(@Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.talentService.getPendingProfiles(+page, +limit);
    return { success: true, data: result };
  }

  @Put('talents/:id/approve')
  @ApiOperation({ summary: 'Approve a talent profile' })
  async approveProfile(@Param('id') id: string) {
    const profile = await this.talentService.approveProfile(id);
    return { success: true, data: profile };
  }

  @Put('talents/:id/reject')
  @ApiOperation({ summary: 'Reject a talent profile with reason' })
  async rejectProfile(@Param('id') id: string, @Body() dto: RejectProfileDto) {
    const profile = await this.talentService.rejectProfile(id, dto.reason);
    return { success: true, data: profile };
  }

  @Put('talents/:id/feature')
  @ApiOperation({ summary: 'Toggle featured status for a talent' })
  async toggleFeatured(@Param('id') id: string, @Body() dto: ToggleFeaturedDto) {
    const profile = await this.talentService.toggleFeatured(id, dto.isFeatured);
    return { success: true, data: profile };
  }

  @Put('talents/:id/verify')
  @ApiOperation({ summary: 'Toggle verified badge for a talent' })
  async toggleVerified(@Param('id') id: string, @Body() dto: ToggleVerifiedDto) {
    const profile = await this.talentService.toggleVerified(id, dto.isVerified);
    return { success: true, data: profile };
  }
}
