import { useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const editSchema = z.object({
  description: z
    .string()
    .min(3, 'A descrição deve ter pelo menos 3 caracteres')
    .max(255, 'A descrição não pode passar de 255 caracteres'),
});

type EditFormData = z.infer<typeof editSchema>;

interface Appointment {
  id: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (id: string, newDescription: string) => Promise<void>;
}

export function EditAppointmentModal({ isOpen, appointment, onClose, onConfirm }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: { description: '' },
  });

  const descriptionLength = watch('description')?.length || 0;

  useEffect(() => {
    if (isOpen && appointment) {
      reset({ description: appointment.description });
    }
  }, [isOpen, appointment, reset]);

  if (!isOpen || !appointment) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: EditFormData) => {
    if (data.description.trim() === appointment.description.trim()) {
      handleClose();
      return;
    }
    await onConfirm(appointment.id, data.description);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">

        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900">Editar Descrição</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
            type="button"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6" autoComplete="off">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descrição / Queixa
              </label>
              <span className={`text-xs font-medium ${descriptionLength >= 255 ? 'text-red-500' : 'text-gray-400'}`}>
                {descriptionLength} / 255
              </span>
            </div>

            <textarea
              {...register('description')}
              id="description"
              rows={4}
              maxLength={255}
              placeholder="Ex: Dor de cabeça persistente há 3 dias..."
              className={`w-full resize-none rounded-lg border px-4 py-2 transition-all outline-none focus:ring-2 ${errors.description ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'focus:ring-primary-500 border-gray-300'
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
            className="bg-blue-600 hover:bg-blue-700 mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-bold text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
