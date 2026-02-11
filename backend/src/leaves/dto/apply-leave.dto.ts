import { IsNotEmpty, IsEnum, IsDateString, IsString, IsNumber } from 'class-validator';
import { LeaveType } from '@prisma/client';

export class ApplyLeaveDto {
    @IsNotEmpty()
    @IsEnum(LeaveType)
    leaveType: LeaveType;

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsNotEmpty()
    @IsDateString()
    endDate: string;

    @IsNotEmpty()
    @IsString()
    reason: string;
}
