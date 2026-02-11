import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('performance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerformanceController {
    constructor(private readonly performanceService: PerformanceService) { }

    @Post('goals')
    createGoal(@GetUser() user: any, @Body() dto: CreateGoalDto) {
        return this.performanceService.createGoal(user.id as string, dto);
    }

    @Get('goals')
    getMyGoals(@GetUser() user: any) {
        return this.performanceService.findAllGoals(user.id as string);
    }

    @Get('goals/team')
    @Roles(Role.MANAGER, Role.ADMIN)
    getTeamGoals(@GetUser() user: any) {
        return this.performanceService.getTeamGoals(user.id as string);
    }
}
