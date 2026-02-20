import { IsEmail, IsString } from 'class-validator'

export class PurgeExceptDto {
  @IsEmail()
  email!: string

  @IsString()
  newPassword!: string
}
