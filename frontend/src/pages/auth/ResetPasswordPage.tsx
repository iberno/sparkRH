import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { cpfSchema } from '../../lib/validators';
import { formatCpf } from '../../lib/formatters';
import { Button, Input, Alert } from '../../components/ui';
import { ThemeToggle } from '../../components/layout';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  cpf: cpfSchema,
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
  newPassword: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError('');
      setIsLoading(true);
      await api.post('/auth/reset-password', {
        cpf: data.cpf,
        code: data.code,
        newPassword: data.newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md px-4">
        <ThemeToggle className="absolute top-4 right-4" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-green-500 mb-4">
            <CheckCircle className="size-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold dark:text-white text-spark-dark font-heading">
            Senha Redefinida
          </h1>
          <p className="mt-2 dark:text-spark-dark-text text-spark-gray">
            Sua senha foi redefinida com sucesso.
          </p>
        </div>

        <div className="dark:bg-spark-dark-surface bg-white border dark:border-spark-dark-border border-gray-200 shadow-2xs rounded-xl p-4 sm:p-7">
          <Link to="/login" className="block text-center">
            <Button className="w-full">
              Fazer Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-4">
      <ThemeToggle className="absolute top-4 right-4" />

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-12 rounded-xl bg-spark-primary mb-4">
          <Shield className="size-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold dark:text-white text-spark-dark font-heading">
          Redefinir Senha
        </h1>
        <p className="mt-2 dark:text-spark-dark-text text-spark-gray">
          Informe o código recebido e sua nova senha.
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
              label="Código de 6 dígitos"
              placeholder="000000"
              error={errors.code?.message}
              {...register('code')}
              maxLength={6}
            />
          </div>

          <div className="mb-4">
            <Input
              type="password"
              label="Nova Senha"
              placeholder="Mín. 8 caracteres"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
          </div>

          <div className="mb-4">
            <Input
              type="password"
              label="Confirmar Senha"
              placeholder="Repita a senha"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Redefinir Senha
          </Button>

          <div className="mt-4 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-spark-primary hover:text-spark-primary-hover hover:underline">
              <ArrowLeft className="size-4" />
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
