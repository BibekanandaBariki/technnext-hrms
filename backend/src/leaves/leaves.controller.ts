import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role, LeaveStatus } from '@prisma/client';
// import type { User } from '@prisma/client';

interface RequestUser {
  id: string;
}

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  apply(@GetUser() user: RequestUser, @Body() dto: ApplyLeaveDto) {
    return this.leavesService.applyLeave(user.id, dto);
  }

  @Get()
  @Get()
  findAll(@GetUser() user: RequestUser) {
    return this.leavesService.findAll(user.id); // For employee to see own leaves
  }

  @Get('pending')
  @Roles(Role.HR, Role.MANAGER, Role.ADMIN)
  findAllPending() {
    return this.leavesService.findAllPending();
  }

  @Patch(':id/approve')
  @Roles(Role.HR, Role.MANAGER, Role.ADMIN)
  approve(@Param('id') id: string, @GetUser() user: RequestUser) {
    return this.leavesService.updateStatus(id, LeaveStatus.APPROVED, user.id);
  }

  @Patch(':id/reject')
  @Roles(Role.HR, Role.MANAGER, Role.ADMIN)
  reject(
    @Param('id') id: string,
    @GetUser() user: RequestUser,
    @Body('reason') reason: string,
  ) {
    return this.leavesService.updateStatus(
      id,
      LeaveStatus.REJECTED,
      user.id,
      reason,
    );
  }
}
