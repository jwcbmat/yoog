import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientEntity } from './patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(PatientEntity)
    private readonly patientRepo: Repository<PatientEntity>,
  ) { }

  async create(data: Partial<PatientEntity>): Promise<PatientEntity> {
    try {
      const patient = this.patientRepo.create(data);
      return await this.patientRepo.save(patient);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Patient with this phone or email already exists.',
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while saving the patient.',
      );
    }
  }

  async findAll(): Promise<PatientEntity[]> {
    return this.patientRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<PatientEntity>): Promise<PatientEntity> {
    await this.patientRepo.update(id, data);
    const updated = await this.patientRepo.findOneBy({ id });
    if (!updated) throw new Error('Patient not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    try {
      await this.patientRepo.delete(id);
    } catch (error: any) {
      if (error.code === '23503') {
        throw new ConflictException(
          'It is not possible to delete a patient who already has a history of consultations.',
        );
      }
      throw new InternalServerErrorException('Error deleting patient.');
    }
  }
}
