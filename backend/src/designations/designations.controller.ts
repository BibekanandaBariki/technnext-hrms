import { Controller, Get, UseGuards } from '@nestjs/common';
import { DesignationsService } from './designations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('designations')
@UseGuards(JwtAuthGuard)
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  @Get()
  findAll() {
    return this.designationsService.findAll();
  }
}
