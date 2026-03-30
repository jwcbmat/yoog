import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { Loader2, Activity, Play, CheckCircle, Trash2, Edit2 } from 'lucide-react';
import { APPOINTMENT_TRANSITIONS } from '@mini-crm/shared';
import { NewAppointmentModal } from '../components/modals/NewAppointmentModal';
import { EditAppointmentModal } from '../components/modals/EditAppointmentModal';
import { toast } from 'sonner';
import { DeleteAppointmentModal } from '../components/modals/DeleteAppointmentModal';

import type { Appointment } from '@mini-crm/shared';

export function AppointmentsDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const queryClient = useQueryClient();
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);

  const { data: appointments = [], isLoading, isError } = useQuery({
    queryKey: ['appointments'],
    queryFn: async (): Promise<Appointment[]> => {
      const response = await api.get('/appointments');
      const rawData = response.data;

      if (rawData && rawData.data && Array.isArray(rawData.data)) {
        return rawData.data;
      }

      return Array.isArray(rawData) && Array.isArray(rawData[0])
        ? rawData[0]
        : Array.isArray(rawData)
          ? rawData
          : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, nextStatus }: { id: string; nextStatus: string }) => {
      await api.patch(`/appointments/${id}/status`, { status: nextStatus });
    },
    onMutate: async ({ id, nextStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['appointments'] });
      const previousAppointments = queryClient.getQueryData<Appointment[]>(['appointments']);

      queryClient.setQueryData<Appointment[]>(['appointments'], (old) => {
        if (!old) return [];
        return old.map((app) =>
          app.id === id ? { ...app, status: nextStatus as Appointment['status'] } : app
        );
      });

      return { previousAppointments };
    },
    onError: (_, __, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(['appointments'], context.previousAppointments);
      }
      toast.error('Erro ao atualizar status. Transição não permitida.');
    },
    onSuccess: (_, variables) => {
      toast.success(`Status: ${variables.nextStatus.replace('_', ' ')}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const updateDescriptionMutation = useMutation({
    mutationFn: async ({ id, description }: { id: string; description: string }) => {
      await api.patch(`/appointments/${id}`, { description });
    },
    onSuccess: () => {
      toast.success('Descrição atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setEditingAppointment(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Falha ao atualizar descrição.')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/appointments/${id}`);
    },
    onSuccess: () => {
      toast.success('Atendimento removido!');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao remover atendimento.');
    }
  });

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      AGUARDANDO: 'bg-yellow-100 text-yellow-800',
      EM_ATENDIMENTO: 'bg-blue-100 text-blue-800',
      FINALIZADO: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="text-primary-500 animate-spin h-8 w-8" /></div>;
  if (isError) return <div className="p-10 text-center text-red-500">Erro ao carregar dados.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="flex items-center text-xl font-semibold text-gray-900">
          <Activity className="text-primary-500 mr-2 h-5 w-5 shrink-0" />
          Fila de Atendimento
        </h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 w-full sm:w-auto rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium text-white shadow-sm transition-colors"
        >
          + Novo Atendimento
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.map((app) => {
                const allowedTransitions = APPOINTMENT_TRANSITIONS[app.status] ?? [];
                const nextPossibleStatus = allowedTransitions[0];

                return (
                  <tr key={app.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{app.patient?.name || 'Não identificado'}</div>
                      <span
                        className="text-xs text-gray-500"
                        style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}
                      >
                        {app.description}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {nextPossibleStatus && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: app.id, nextStatus: nextPossibleStatus })}
                            disabled={updateStatusMutation.isPending}
                            className="bg-primary-600 hover:bg-primary-700 inline-flex items-center rounded px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all disabled:opacity-50"
                          >
                            {updateStatusMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : nextPossibleStatus === 'EM_ATENDIMENTO' ? (
                              <><Play className="mr-1 h-3 w-3" /> Iniciar</>
                            ) : (
                              <><CheckCircle className="mr-1 h-3 w-3" /> Finalizar</>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(app)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar Descrição"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingAppointment(app)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <NewAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['appointments'] })}
      />

      <EditAppointmentModal
        isOpen={!!editingAppointment}
        appointment={editingAppointment}
        onClose={() => setEditingAppointment(null)}
        onConfirm={async (id: string, description: string) => {
          await updateDescriptionMutation.mutateAsync({ id, description });
        }}
      />

      <DeleteAppointmentModal
        isOpen={!!deletingAppointment}
        appointment={deletingAppointment}
        onClose={() => setDeletingAppointment(null)}
        isDeleting={deleteMutation.isPending}
        onConfirm={async (id) => {
          await deleteMutation.mutateAsync(id);
        }}
      />
    </div>
  );
}
