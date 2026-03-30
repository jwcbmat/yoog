import { z } from 'zod';

export const AppointmentStatusSchema = z.enum([
  'AGUARDANDO',
  'EM_ATENDIMENTO',
  'FINALIZADO',
]);
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
});
export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentStatusSchema = z.object({
  status: AppointmentStatusSchema,
});
export type UpdateAppointmentStatusDto = z.infer<typeof updateAppointmentStatusSchema>;

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  description: z.string(),
  status: AppointmentStatusSchema,
  createdAt: z.date(),
});
export type Appointment = z.infer<typeof AppointmentSchema>;
