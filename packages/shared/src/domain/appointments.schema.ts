import { z } from 'zod';

export const AppointmentStatusSchema = z.enum([
  'AGUARDANDO',
  'EM_ATENDIMENTO',
  'FINALIZADO',
]);

export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  status: AppointmentStatusSchema,
  createdAt: z.date(),
  patient: z
    .object({
      name: z.string(),
      phone: z.string(),
    })
    .optional(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
});

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;


export const updateAppointmentSchema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
});

export type UpdateAppointmentDto = z.infer<typeof updateAppointmentSchema>;
