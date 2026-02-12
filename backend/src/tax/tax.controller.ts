import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TaxService } from './tax.service';
import { DeclareTaxDto } from './dto/declare-tax.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
// import type { User } from '@prisma/client';

interface RequestUser {
  id: string;
  email: string;
  role: string;
}

@Controller('tax')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post('declare')
  declare(@GetUser() user: RequestUser, @Body() dto: DeclareTaxDto) {
    return this.taxService.declareTax(user.id, dto);
  }

  @Get('declarations')
  findAll(@GetUser() user: RequestUser) {
    return this.taxService.getMyDeclarations(user.id);
  }
}
