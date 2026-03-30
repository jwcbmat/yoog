import { useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { normalizePhone } from '../../utils/masks';

const editPatientSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  phone: z.string().min(14, 'Telefone incompleto'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type EditPatientFormData = z.infer<typeof editPatientSchema>;

interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

interface Props {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onConfirm: (id: string, data: EditPatientFormData) => Promise<void>;
}

export function EditPatientModal({ isOpen, patient, onClose, onConfirm }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema),
  });

  useEffect(() => {
    if (isOpen && patient) {
      reset({
        name: patient.name,
        phone: normalizePhone(patient.phone),
        email: patient.email || '',
        notes: patient.notes || '',
      });
    }
  }, [isOpen, patient, reset]);

  if (!isOpen || !patient) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: EditPatientFormData) => {
    const sanitizedData = {
      name: data.name,
      phone: data.phone,
      email: data.email ? data.email : null,
      notes: data.notes ? data.notes : null,
    };

    // @ts-ignore
    await onConfirm(patient.id, sanitizedData);
    handleClose();
  };

  const { onChange: onPhoneChange, ...restPhoneProps } = register('phone');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">

        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900">Editar Paciente</h2>
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
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Nome Completo</label>
            <input
              {...register('name')}
              id="name"
              type="text"
              autoComplete="off"
              data-lpignore="true"
              className={`w-full rounded-lg border px-4 py-2 transition-all outline-none focus:ring-2 ${errors.name ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'focus:ring-primary-500 border-gray-300'}`}
            />
            {errors.name && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600"><AlertCircle className="h-3 w-3" /> {errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefone</label>
            <input
              {...restPhoneProps}
              id="phone"
              type="text"
              autoComplete="off"
              data-lpignore="true"
              placeholder="(00) 00000-0000"
              maxLength={15}
              onChange={(e) => {
                e.target.value = normalizePhone(e.target.value);
                onPhoneChange(e);
              }}
              className={`w-full rounded-lg border px-4 py-2 transition-all outline-none focus:ring-2 ${errors.phone ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'focus:ring-primary-500 border-gray-300'}`}
            />
            {errors.phone && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600"><AlertCircle className="h-3 w-3" /> {errors.phone.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail (Opcional)</label>
            <input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="off"
              data-lpignore="true"
              className={`w-full rounded-lg border px-4 py-2 transition-all outline-none focus:ring-2 ${errors.email ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'focus:ring-primary-500 border-gray-300'}`}
            />
            {errors.email && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600"><AlertCircle className="h-3 w-3" /> {errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-bold text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}
