import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { loginSchema, type LoginFormData } from '../../lib/validators';
import { formatCpf } from '../../lib/formatters';
import { Button, Input, Alert } from '../../components/ui';
import { ThemeToggle } from '../../components/layout';

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

  return (
    <div className="w-full max-w-md px-4">
      <ThemeToggle className="absolute top-4 right-4" />

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
          {error && <Alert variant="error" className="mb-4">{error}</Alert>}

          <div className="mb-4">
            <Input
              label="CPF"
              placeholder="000.000.000-00"
              error={errors.cpf?.message}
              {...register('cpf')}
              onChange={(e) => {
                e.target.value = formatCpf(e.target.value);
                register('cpf').onChange(e);
              }}
            />
          </div>

          <div className="mb-4">
            <Input
              type="password"
              label="Senha"
              placeholder="Sua senha"
              error={errors.password?.message}
              {...register('password')}
            />
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

          <Button type="submit" isLoading={isLoading} className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
