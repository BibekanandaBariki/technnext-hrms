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
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: (configService.get<string>('JWT_ACCESS_EXPIRY') || '15m') as any },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, JwtStrategy, RolesGuard],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
