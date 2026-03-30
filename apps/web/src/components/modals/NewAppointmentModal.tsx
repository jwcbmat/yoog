import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/axios';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateAppointmentDto } from '@mini-crm/shared';

const appointmentFormSchema = z.object({
  patientId: z.string().uuid('Selecione um paciente válido'),
  description: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(500, 'A descrição não pode passar de 500 caracteres'),
});

type AppointmentFormData = CreateAppointmentDto;

interface Patient {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewAppointmentModal({ isOpen, onClose, onSuccess }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: { patientId: '', description: '' },
  });

  useEffect(() => {
    if (isOpen) {
      api.get('/patients').then((res) => setPatients(res.data));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      await api.post('/appointments', data);
      toast.success('Atendimento agendado com sucesso!');
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error('Erro ao criar o atendimento. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900">Novo Atendimento</h2>
          <button
            onClick={handleClose}
            type="button"
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Selecione o Paciente
            </label>
            <select
              {...register('patientId')}
              className={`focus:ring-primary-500 w-full rounded-lg border px-4 py-2 transition-all outline-none focus:ring-2 ${errors.patientId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
            >
              <option value="">Escolha um paciente...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="h-3 w-3" /> {errors.patientId.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Descrição/Queixa
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Ex: Dor de cabeça persistente há 3 dias..."
              className={`focus:ring-primary-500 w-full resize-none rounded-lg border px-4 py-2 transition-all outline-none focus:ring-2 ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
            />
            {errors.description && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="h-3 w-3" /> {errors.description.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-600 hover:bg-primary-700 shadow-primary-500/20 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-bold text-white shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Confirmar Agendamento'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
