import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  type CreateAppointmentDto,
  type UpdateAppointmentDto,
} from '@mini-crm/shared';
import { type UpdateAppointmentStatusDto, updateAppointmentStatusSchema } from './appointments.schema';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post()
  async createAppointment(
    @Body(new ZodValidationPipe(createAppointmentSchema)) body: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(body.patientId, body.description);
  }

  @Get()
  async listAppointments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.appointmentsService.findAll(page, limit);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAppointmentStatusSchema)) body: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(id, body.status);
  }

  @Patch(':id')
  async updateDescription(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAppointmentSchema)) body: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.updateDescription(id, body.description);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
