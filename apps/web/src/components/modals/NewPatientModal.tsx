import { useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/axios';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { normalizePhone } from '../../utils/masks';
import type { CreatePatientDto } from '@mini-crm/shared';

const patientSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 letras')
    .max(100, 'O nome não pode passar de 100 caracteres')
    .regex(
      /^[a-zA-ZÀ-ÿ\s]*$/,
      'O nome não pode conter números ou caracteres especiais',
    ),

  phone: z
    .string()
    .min(14, 'Telefone incompleto (Ex: (11) 99999-9999)')
    .max(15, 'Telefone inválido'),

  email: z
    .string()
    .email('E-mail inválido')
    .max(150, 'E-mail muito longo')
    .optional()
    .or(z.literal('')),
});

type PatientFormData = CreatePatientDto;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewPatientModal({ isOpen, onClose, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { name: '', phone: '', email: '' },
  });

  const phoneValue = watch('phone');
  useEffect(() => {
    setValue('phone', normalizePhone(phoneValue));
  }, [phoneValue, setValue]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      const rawPhone = data.phone.replace(/\D/g, '');

      if (rawPhone.length < 10) {
        toast.error('O telefone fornecido não tem números suficientes.');
        return;
      }

      const unmaskedData = {
        ...data,
        phone: rawPhone,
      };

      await api.post('/patients', unmaskedData);
      toast.success('Paciente cadastrado com sucesso!');
      onSuccess();
      handleClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error('Este telefone ou e-mail já está cadastrado no sistema.');
      } else {
        toast.error('Erro inesperado ao cadastrar paciente.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Novo Paciente</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nome Completo
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              className={`mt-1 w-full rounded-lg border px-4 py-2 transition-all outline-none focus:ring-2 ${errors.name
                ? 'border-red-500 bg-red-50 focus:ring-red-200'
                : 'focus:ring-primary-500 border-gray-300'
                }`}
              placeholder="Ex: João da Silva"
            />
            {errors.name && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="h-3 w-3" /> {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Telefone
            </label>
            <input
              {...register('phone')}
              id="phone"
              type="text"
              inputMode="tel"
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              className={`mt-1 w-full rounded-lg border px-4 py-2 transition-all outline-none focus:ring-2 ${errors.phone
                ? 'border-red-500 bg-red-50 focus:ring-red-200'
                : 'focus:ring-primary-500 border-gray-300'
                }`}
              placeholder="(00) 00000-0000"
            />
            {errors.phone && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="h-3 w-3" /> {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-mail (Opcional)
            </label>
            <input
              {...register('email')}
              id="email"
              type="text"
              inputMode="email"
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              className={`mt-1 w-full rounded-lg border px-4 py-2 transition-all outline-none focus:ring-2 ${errors.email
                ? 'border-red-500 bg-red-50 focus:ring-red-200'
                : 'focus:ring-primary-500 border-gray-300'
                }`}
              placeholder="joao@email.com"
            />
            {errors.email && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="h-3 w-3" /> {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-600 hover:bg-primary-700 mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-bold text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Cadastrar Paciente'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
