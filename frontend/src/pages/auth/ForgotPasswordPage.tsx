import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { cpfSchema } from '../../lib/validators';
import { formatCpf } from '../../lib/formatters';
import { Button, Input } from '../../components/ui';
import { ThemeToggle } from '../../components/layout';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  cpf: cpfSchema,
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await api.post('/auth/forgot-password', { cpf: data.cpf });
      toast.success('Código enviado com sucesso! Verifique seu telefone.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao solicitar código');
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
          Esqueci Minha Senha
        </h1>
        <p className="mt-2 dark:text-spark-dark-text text-spark-gray">
          Informe seu CPF para receber um código de recuperação.
        </p>
      </div>

      <div className="dark:bg-spark-dark-surface bg-white border dark:border-spark-dark-border border-gray-200 shadow-2xs rounded-xl p-4 sm:p-7">
        <form onSubmit={handleSubmit(onSubmit)}>
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

          <Button type="submit" isLoading={isLoading} className="w-full">
            Enviar Código
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
