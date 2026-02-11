import { Controller, Post, Body, Get, UseGuards, Ip, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PunchInDto } from './dto/punch-in.dto';
import { PunchOutDto } from './dto/punch-out.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { User } from '@prisma/client';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post('punch-in')
    punchIn(@GetUser() user: any, @Body() dto: PunchInDto, @Ip() ip: string) {
        // In production, get IP from request headers (x-forwarded-for) if behind proxy
        return this.attendanceService.punchIn(user.id as string, dto, ip);
    }

    @Post('punch-out')
    punchOut(@GetUser() user: any, @Body() dto: PunchOutDto) {
        return this.attendanceService.punchOut(user.id as string, dto);
    }

    @Get('today')
    getToday(@GetUser() user: any) {
        return this.attendanceService.getTodayStatus(user.id as string);
    }

    @Get('my-attendance')
    getMyAttendance(@GetUser() user: any) {
        return this.attendanceService.findAll(user.id as string);
    }
}
