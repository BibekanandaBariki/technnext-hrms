
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
    constructor(private prisma: PrismaService) { }

    findAll() {
        return this.prisma.department.findMany();
    }
}
