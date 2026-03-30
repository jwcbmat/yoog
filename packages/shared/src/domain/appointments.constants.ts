import { AppointmentStatus } from './appointments.schema';

export const APPOINTMENT_TRANSITIONS: Record<
  AppointmentStatus,
  readonly AppointmentStatus[]
> = {
  AGUARDANDO: ['EM_ATENDIMENTO'],
  EM_ATENDIMENTO: ['FINALIZADO'],
  FINALIZADO: [],
};

export function canTransitionTo(
  current: AppointmentStatus,
  next: AppointmentStatus,
): boolean {
  return APPOINTMENT_TRANSITIONS[current].includes(next);
}
