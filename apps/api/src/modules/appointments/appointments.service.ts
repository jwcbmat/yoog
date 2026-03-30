import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { AppointmentEntity } from './appointments.entity';
import { APPOINTMENT_TRANSITIONS } from '@mini-crm/shared';
import type { AppointmentStatus } from '@mini-crm/shared';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepo: Repository<AppointmentEntity>,
  ) { }

  async create(patientId: string, description: string): Promise<AppointmentEntity> {
    try {
      const appointment = this.appointmentRepo.create({
        patientId,
        description,
        status: 'AGUARDANDO',
      });
      return await this.appointmentRepo.save(appointment);
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError.code === '23503') {
        throw new NotFoundException(`Patient with ID ${patientId} not found or invalid constraint.`);
      }
      throw error;
    }
  }

  async updateStatus(id: string, newStatus: AppointmentStatus): Promise<AppointmentEntity> {
    const appointment = await this.appointmentRepo.findOneOrFail({ where: { id } })
      .catch(() => { throw new NotFoundException('Appointment not found'); });

    const currentStatus = appointment.status;
    const allowedTransitions = APPOINTMENT_TRANSITIONS[currentStatus] as readonly string[];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException('Invalid transition');
    }

    appointment.status = newStatus;
    return await this.appointmentRepo.save(appointment);
  }

  async findAll(page: number = 1, limit: number = 20) {
    const [data, total] = await this.appointmentRepo.findAndCount({
      relations: ['patient'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  async updateDescription(id: string, description: string) {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    appointment.description = description;
    return this.appointmentRepo.save(appointment);
  }
}
