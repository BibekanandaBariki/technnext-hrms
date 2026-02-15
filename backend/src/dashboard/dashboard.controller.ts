import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin-stats')
  @Roles(Role.ADMIN, Role.HR)
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('manager-stats')
  @Roles(Role.MANAGER, Role.ADMIN)
  getManagerStats(@GetUser() user: { id: string }) {
    return this.dashboardService.getManagerStats(user.id);
  }

  @Get('manager-team')
  @Roles(Role.MANAGER, Role.ADMIN)
  getManagerTeam(@GetUser() user: { id: string }) {
    return this.dashboardService.getManagerTeam(user.id);
  }
}
