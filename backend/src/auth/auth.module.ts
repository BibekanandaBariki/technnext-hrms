import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    PrismaModule,
    EmailModule,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - JWT module type definition issue with string expiresIn
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const options = {
          secret: configService.get<string>('JWT_SECRET') || 'default-secret',
          signOptions: {
            expiresIn: configService.get<string>('JWT_ACCESS_EXPIRY') || '15m',
          },
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return options as any;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
