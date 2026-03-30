import { APPOINTMENT_TRANSITIONS } from '@mini-crm/shared';
import type { AppointmentStatus } from '@mini-crm/shared';

export const useAppointmentActions = (currentStatus: AppointmentStatus) => {
  const allowedNextStates = APPOINTMENT_TRANSITIONS[currentStatus];

  return {
    canFinish: allowedNextStates.includes('FINALIZADO'),
    canStart: allowedNextStates.includes('EM_ATENDIMENTO'),
    isLocked: allowedNextStates.length === 0,
  };
};
