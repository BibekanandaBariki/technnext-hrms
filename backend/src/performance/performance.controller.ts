import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';
// import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';

interface RequestUser {
  id: string;
  email: string;
  role: string;
}

@Controller('performance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post('goals')
  createGoal(@GetUser() user: RequestUser, @Body() dto: CreateGoalDto) {
    return this.performanceService.createGoal(user.id, dto);
  }

  @Get('goals')
  getMyGoals(@GetUser() user: RequestUser) {
    return this.performanceService.findAllGoals(user.id);
  }

  @Get('goals/team')
  @Roles(Role.MANAGER, Role.ADMIN)
  getTeamGoals(@GetUser() user: RequestUser) {
    return this.performanceService.getTeamGoals(user.id);
  }
}
