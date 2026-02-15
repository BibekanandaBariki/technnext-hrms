import { IsNotEmpty, IsString } from 'class-validator';

export class PresignDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  mimeType: string;
}
