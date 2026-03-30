import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { AppointmentEntity } from './modules/appointments/appointments.entity';
import { PatientEntity } from './modules/patients/patient.entity';
import { UserEntity } from './modules/auth/user.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://staff_user:postgres@localhost:5432/yoog_db',
  entities: [AppointmentEntity, PatientEntity, UserEntity],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
