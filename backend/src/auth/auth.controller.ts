import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { PurgeExceptDto } from './dto/purge-except.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { GetUser } from './decorators/get-user.decorator';
import type { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ access_token: string; user: Omit<User, 'passwordHash'> }> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@GetUser() user: User) {
    return user;
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Get('validate-reset-token')
  async validateResetToken(
    @Query('token') token: string,
  ): Promise<{ valid: boolean }> {
    const isValid = await this.authService.validateResetToken(token);
    return { valid: isValid };
  }

  @Post('google-login')
  async googleLogin(
    @Body() dto: GoogleLoginDto,
  ): Promise<{ access_token: string; user: Omit<User, 'passwordHash'> }> {
    return this.authService.googleLogin(dto.idToken);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('purge-users')
  async purgeUsers(): Promise<{ updated: number; sessionsDeleted: number }> {
    return this.authService.purgeNonAdminCredentials();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('purge-except')
  async purgeExcept(@Body() dto: PurgeExceptDto): Promise<{
    preservedUserId: string;
    usersDeleted: number;
    employeesDeleted: number;
  }> {
    return this.authService.purgeAllExcept(dto.email, dto.newPassword);
  }
}
