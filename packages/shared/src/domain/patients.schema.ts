import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'Name cannot contain numbers or special characters'),
  phone: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone must not exceed 15 digits'),
  email: z
    .string()
    .email('Invalid email format')
    .max(150, 'Email must not exceed 150 characters')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional().nullable(),
});

export type CreatePatientDto = z.infer<typeof createPatientSchema>;

export const updatePatientSchema = createPatientSchema.partial();

export type UpdatePatientDto = z.infer<typeof updatePatientSchema>;

export const PatientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  email: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.date(),
});

export type Patient = z.infer<typeof PatientSchema>;
