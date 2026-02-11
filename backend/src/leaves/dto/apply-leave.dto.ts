import { IsNotEmpty, IsEnum, IsDateString, IsString, IsNumber } from 'class-validator';
// import { LeaveType } from '@prisma/client';

export class ApplyLeaveDto {
    @IsNotEmpty()
    @IsNotEmpty()
    @IsEnum(['SICK_LEAVE', 'CASUAL_LEAVE', 'PAID_LEAVE', 'MATERNITY_LEAVE', 'PATERNITY_LEAVE', 'UNPAID_LEAVE'])
    leaveType: string;

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
