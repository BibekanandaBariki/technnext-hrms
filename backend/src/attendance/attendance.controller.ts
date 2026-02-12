import { Controller, Post, Body, Get, UseGuards, Ip, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PunchInDto } from './dto/punch-in.dto';
import { PunchOutDto } from './dto/punch-out.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
// import type { User } from '@prisma/client';

interface RequestUser {
    id: string
    email: string
    role: string
}

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post('punch-in')
    punchIn(@GetUser() user: RequestUser, @Body() dto: PunchInDto, @Ip() ip: string) {
        // In production, get IP from request headers (x-forwarded-for) if behind proxy
        return this.attendanceService.punchIn(user.id, dto, ip);
    }

    @Post('punch-out')
    punchOut(@GetUser() user: RequestUser, @Body() dto: PunchOutDto) {
        return this.attendanceService.punchOut(user.id, dto);
    }

    @Get('today')
    getToday(@GetUser() user: RequestUser) {
        return this.attendanceService.getTodayStatus(user.id);
    }

    @Get('my-attendance')
    getMyAttendance(@GetUser() user: RequestUser) {
        return this.attendanceService.findAll(user.id);
    }
}
