import { IsOptional, IsString } from 'class-validator';

export class PunchOutDto {
    @IsOptional()
    @IsString()
    remarks?: string;

    @IsOptional()
    @IsString()
    location?: string;

    // IP injection might happen in controller via request object
}
