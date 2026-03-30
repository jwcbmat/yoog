import { useNavigate } from 'react-router-dom';
import { Stethoscope, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/axios';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Formato de e-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post('/auth/login', data);

      localStorage.setItem('@mini-crm:token', response.data.access_token);
      localStorage.setItem(
        '@mini-crm:user',
        JSON.stringify(response.data.user),
      );

      toast.success('Sessão iniciada com sucesso!');
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error('E-mail ou senha incorretos.');
      } else {
        toast.error('Erro ao conectar ao servidor. Tente novamente.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-md space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-xl duration-500">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="bg-primary-50 mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <Stethoscope className="text-primary-600 h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Yoog Saúde
          </h1>
          <p className="text-sm text-gray-500">Acesso ao painel do Mini CRM</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-mail
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              className={`mt-1 w-full rounded-lg border px-4 py-2 transition-all outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-500 focus:ring-red-200'
                  : 'focus:ring-primary-500 border-gray-300'
              }`}
              placeholder="admin@yoog.com"
            />
            {errors.email && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="h-3 w-3" /> {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              {...register('password')}
              id="password"
              type="password"
              autoComplete="current-password"
              className={`mt-1 w-full rounded-lg border px-4 py-2 transition-all outline-none focus:ring-2 ${
                errors.password
                  ? 'border-red-500 focus:ring-red-200'
                  : 'focus:ring-primary-500 border-gray-300'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="h-3 w-3" /> {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-bold text-white shadow-sm transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
