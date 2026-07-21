import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2, Sun, Moon, Shield } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

const loginSchema = z.object({
  cpf: z.string().min(14, 'CPF deve ter 14 caracteres'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { theme, toggleTheme } = useThemeStore();
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
    <div className="dark:bg-spark-dark-bg bg-spark-light flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 relative font-body">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 size-9 flex justify-center items-center rounded-lg dark:text-spark-dark-text text-spark-gray hover:bg-gray-200 dark:hover:bg-spark-dark-surface focus:outline-none focus:ring-2 focus:ring-spark-primary transition-colors"
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-spark-primary mb-4">
            <Shield className="size-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold dark:text-white text-spark-dark font-heading">
            Spark RH & DP Portal
          </h1>
          <p className="mt-2 dark:text-spark-dark-text text-spark-gray">
            Faça login com seu CPF
          </p>
        </div>

        <div className="dark:bg-spark-dark-surface bg-white border dark:border-spark-dark-border border-gray-200 shadow-2xs rounded-xl p-4 sm:p-7">
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="mb-4 flex items-center gap-3 p-4 dark:bg-red-500/10 bg-red-50 border dark:border-red-500/30 border-red-200 rounded-lg">
                <AlertCircle className="size-4 dark:text-red-400 text-red-600 shrink-0" />
                <span className="text-sm dark:text-red-400 text-red-800">{error}</span>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="cpf" className="block mb-2 text-sm dark:text-spark-dark-text text-spark-dark font-medium">
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
                className={`py-2.5 px-4 block w-full border dark:bg-spark-dark-bg dark:text-spark-dark-text bg-gray-50 text-spark-dark rounded-lg text-sm focus:border-spark-primary focus:ring-spark-primary disabled:opacity-50 disabled:pointer-events-none ${
                  errors.cpf
                    ? 'dark:border-red-500/50 border-red-500'
                    : 'dark:border-spark-dark-border border-gray-200'
                }`}
              />
              {errors.cpf && (
                <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 text-sm dark:text-spark-dark-text text-spark-dark font-medium">
                Senha
              </label>
              <input
                type="password"
                id="password"
                {...register('password')}
                placeholder="Sua senha"
                className={`py-2.5 px-4 block w-full border dark:bg-spark-dark-bg dark:text-spark-dark-text bg-gray-50 text-spark-dark rounded-lg text-sm focus:border-spark-primary focus:ring-spark-primary disabled:opacity-50 disabled:pointer-events-none ${
                  errors.password
                    ? 'dark:border-red-500/50 border-red-500'
                    : 'dark:border-spark-dark-border border-gray-200'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="border dark:border-spark-dark-border border-gray-300 rounded dark:bg-spark-dark-bg bg-gray-50 text-spark-primary focus:ring-spark-primary"
                />
                <span className="text-sm dark:text-spark-dark-text text-spark-gray">Lembrar-me</span>
              </label>
              <a className="text-sm text-spark-primary hover:text-spark-primary-hover hover:underline" href="#">
                Esqueci minha senha
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 inline-flex justify-center items-center gap-2 rounded-lg border border-transparent bg-spark-primary text-white hover:bg-spark-primary-hover focus:outline-none focus:ring-2 focus:ring-spark-primary focus:ring-offset-2 transition-all text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
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
