import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { Users, Plus, Mail, Phone, Edit2, Trash2, Loader2 } from 'lucide-react';
import { NewPatientModal } from '../components/modals/NewPatientModal';
import { EditPatientModal } from '../components/modals/EditPatientModal';
import { DeletePatientModal } from '../components/modals/DeletePatientModal';
import type { Patient, UpdatePatientDto } from '@mini-crm/shared';
import { toast } from 'sonner';


export function PatientsDashboard() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async (): Promise<Patient[]> => {
      const res = await api.get('/patients');
      return res.data;
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePatientDto }) => {
      await api.patch(`/patients/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Paciente atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (err: any) => {
      const isValidationError = err.response?.status === 400;
      const backendMessage = err.response?.data?.message;

      if (isValidationError || backendMessage === 'Input data validation failed') {
        toast.error('Dados inválidos. Verifique se o formato do e-mail e telefone estão corretos.');
      } else {
        toast.error(backendMessage || 'Erro ao atualizar paciente.');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/patients/${id}`);
    },
    onSuccess: () => {
      toast.success('Paciente removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao remover paciente.');
    }
  });

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="text-primary-500 animate-spin h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          <Users className="text-primary-500" /> Pacientes Cadastrados
        </h3>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 sm:py-2 text-white transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Novo Paciente
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="group relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary-200"
          >
            <div className="absolute top-4 right-4 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditingPatient(patient)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar Paciente"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeletingPatient(patient)}
                disabled={deleteMutation.isPending}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Excluir Paciente"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <h4 className="mb-4 pr-16 text-lg font-bold text-gray-900 truncate">
              {patient.name}
            </h4>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" /> {patient.phone}
              </div>
              {patient.email && (
                <div className="flex items-center gap-2 truncate">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" /> {patient.email}
                </div>
              )}
            </div>
          </div>
        ))}

        {patients.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            Nenhum paciente cadastrado ainda.
          </div>
        )}
      </div>

      <NewPatientModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['patients'] })}
      />

      <EditPatientModal
        isOpen={!!editingPatient}
        patient={editingPatient}
        onClose={() => setEditingPatient(null)}
        onConfirm={async (id, data) => {
          await updatePatientMutation.mutateAsync({ id, data });
        }}
      />

      <DeletePatientModal
        isOpen={!!deletingPatient}
        patient={deletingPatient}
        onClose={() => setDeletingPatient(null)}
        isDeleting={deleteMutation.isPending}
        onConfirm={async (id) => {
          await deleteMutation.mutateAsync(id);
        }}
      />
    </div>
  );
}
