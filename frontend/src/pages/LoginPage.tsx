import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

const loginSchema = z.object({
  cpf: z.string().min(14, 'CPF deve ter 14 caracteres'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      setIsLoading(true);
      const response = await api.post('/auth/login', {
        cpf: data.cpf,
        password: data.password,
      });
      setAuth(response.data.access_token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCpf = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  return (
    <div className="dark:bg-neutral-900 bg-neutral-50 flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold dark:text-white text-gray-900">
            Spark RH & DP Portal
          </h1>
          <p className="mt-2 dark:text-neutral-400 text-gray-600">
            Faça login com seu CPF
          </p>
        </div>

        {/* Card */}
        <div className="dark:bg-neutral-800 bg-white border dark:border-neutral-700 border-gray-200 shadow-2xs rounded-xl p-4 sm:p-7">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Error Alert */}
            {error && (
              <div className="mb-4 flex items-center gap-3 p-4 dark:bg-red-500/10 bg-red-50 border dark:border-red-500/30 border-red-200 rounded-lg">
                <span className="shrink-0 inline-flex items-center justify-center size-8 rounded-full dark:bg-red-500/20 bg-red-100">
                  <svg className="shrink-0 size-4 dark:text-red-400 text-red-600" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                  </svg>
                </span>
                <span className="text-sm dark:text-red-400 text-red-800">{error}</span>
              </div>
            )}

            {/* CPF Input */}
            <div className="mb-4">
              <label htmlFor="cpf" className="block mb-2 text-sm dark:text-neutral-200 text-gray-700 font-medium">
                CPF
              </label>
              <input
                type="text"
                id="cpf"
                {...register('cpf')}
                onChange={(e) => {
                  e.target.value = formatCpf(e.target.value);
                  register('cpf').onChange(e);
                }}
                placeholder="000.000.000-00"
                className={`py-2.5 px-4 block w-full border dark:bg-neutral-900 bg-gray-50 dark:text-neutral-400 text-gray-900 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none ${
                  errors.cpf
                    ? 'dark:border-red-500/50 border-red-500'
                    : 'dark:border-neutral-700 border-gray-200'
                }`}
              />
              {errors.cpf && (
                <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 text-sm dark:text-neutral-200 text-gray-700 font-medium">
                Senha
              </label>
              <input
                type="password"
                id="password"
                {...register('password')}
                placeholder="Sua senha"
                className={`py-2.5 px-4 block w-full border dark:bg-neutral-900 bg-gray-50 dark:text-neutral-400 text-gray-900 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none ${
                  errors.password
                    ? 'dark:border-red-500/50 border-red-500'
                    : 'dark:border-neutral-700 border-gray-200'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me / Forgot password */}
            <div className="flex items-center justify-between mb-6">
              <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="border dark:border-neutral-600 border-gray-300 rounded dark:bg-neutral-900 bg-gray-50 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm dark:text-neutral-400 text-gray-600">Lembrar-me</span>
              </label>
              <a className="text-sm text-blue-600 hover:text-blue-700 hover:underline" href="#">
                Esqueci minha senha
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 inline-flex justify-center items-center gap-2 rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
