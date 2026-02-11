import { IsNotEmpty, IsString, IsInt, IsDateString, Min, Max } from 'class-validator';

export class CreateGoalDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(4)
    quarter: number;

    @IsNotEmpty()
    @IsInt()
    year: number;

    @IsNotEmpty()
    @IsDateString()
    targetDate: string;
}
