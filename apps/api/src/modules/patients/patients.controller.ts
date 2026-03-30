import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  createPatientSchema,
  updatePatientSchema,
  type CreatePatientDto,
  type UpdatePatientDto,
} from '@mini-crm/shared';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) { }

  @Post()
  async createPatient(
    @Body(new ZodValidationPipe(createPatientSchema)) body: CreatePatientDto,
  ) {
    return this.patientsService.create(body);
  }

  @Get()
  async listPatients() {
    return this.patientsService.findAll();
  }

  @Patch(':id')
  async updatePatient(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePatientSchema)) body: UpdatePatientDto,
  ) {
    return this.patientsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePatient(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
