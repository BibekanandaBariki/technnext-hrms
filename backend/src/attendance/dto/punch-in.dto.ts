import { IsOptional, IsString } from 'class-validator';

export class PunchInDto {
    @IsOptional()
    @IsString()
    remarks?: string;

    @IsOptional()
    @IsString()
    location?: string; // Could be lat,long or address

    @IsOptional()
    @IsString()
    ipAddress?: string;
}
