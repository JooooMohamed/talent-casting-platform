import {
  Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Get,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return { success: true, data: result };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive tokens' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return { success: true, data: result };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: { userId: string; refreshToken: string }) {
    const result = await this.authService.refreshTokens(body.userId, body.refreshToken);
    return { success: true, data: result };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('_id') userId: string) {
    await this.authService.logout(userId);
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async me(@CurrentUser() user: any) {
    return { success: true, data: user };
  }
}
