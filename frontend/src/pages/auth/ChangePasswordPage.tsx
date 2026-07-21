import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { Button, Input, Alert } from '../../components/ui';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
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

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setError('');
      setIsLoading(true);
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold dark:text-white text-spark-dark font-heading mb-6">
        Alterar Senha
      </h1>

      <div className="max-w-md">
        <div className="dark:bg-spark-dark-surface bg-white border dark:border-spark-dark-border border-gray-200 shadow-2xs rounded-xl p-4 sm:p-7">
          {success && (
            <Alert variant="success" className="mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4" />
                Senha alterada com sucesso!
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            <div className="mb-4">
              <Input
                type="password"
                label="Senha Atual"
                placeholder="Sua senha atual"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
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
                label="Confirmar Nova Senha"
                placeholder="Repita a nova senha"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              <Lock className="size-4 mr-2" />
              Alterar Senha
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
