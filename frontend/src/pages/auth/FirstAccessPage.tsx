import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { cpfSchema } from '../../lib/validators';
import { formatCpf } from '../../lib/formatters';
import { Button, Input } from '../../components/ui';
import { ThemeToggle } from '../../components/layout';
import { z } from 'zod';

const firstAccessSchema = z.object({
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

type FirstAccessFormData = z.infer<typeof firstAccessSchema>;

export function FirstAccessPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState<'request' | 'set-password'>('request');
  const [cpf, setCpf] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const requestForm = useForm<{ cpf: string }>({
    resolver: zodResolver(z.object({ cpf: cpfSchema })),
  });

  const passwordForm = useForm<FirstAccessFormData>({
    resolver: zodResolver(firstAccessSchema),
  });

  const onRequestCode = async (data: { cpf: string }) => {
    try {
      setIsLoading(true);
      await api.post('/auth/first-access-code', { cpf: data.cpf });
      setCpf(data.cpf);
      setStep('set-password');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao solicitar código');
    } finally {
      setIsLoading(false);
    }
  };

  const onSetPassword = async (data: FirstAccessFormData) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/first-access', {
        cpf: data.cpf,
        code: data.code,
        newPassword: data.newPassword,
      });
      const { access_token, refresh_token, user } = response.data;
      setAuth(access_token, refresh_token, user);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao definir senha');
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
          Primeiro Acesso
        </h1>
        <p className="mt-2 dark:text-spark-dark-text text-spark-gray">
          {step === 'request'
            ? 'Informe seu CPF para receber um código.'
            : 'Informe o código e defina sua senha.'}
        </p>
      </div>

      <div className="dark:bg-spark-dark-surface bg-white border dark:border-spark-dark-border border-gray-200 shadow-2xs rounded-xl p-4 sm:p-7">
        {step === 'request' ? (
          <form onSubmit={requestForm.handleSubmit(onRequestCode)}>
            <div className="mb-4">
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                error={requestForm.formState.errors.cpf?.message}
                {...requestForm.register('cpf')}
                onChange={(e) => {
                  e.target.value = formatCpf(e.target.value);
                  requestForm.register('cpf').onChange(e);
                }}
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Enviar Código
            </Button>
          </form>
        ) : (
          <form onSubmit={passwordForm.handleSubmit(onSetPassword)}>
            <div className="mb-4">
              <Input
                label="CPF"
                value={formatCpf(cpf)}
                disabled
              />
            </div>

            <div className="mb-4">
              <Input
                label="Código de 6 dígitos"
                placeholder="000000"
                error={passwordForm.formState.errors.code?.message}
                {...passwordForm.register('code')}
                maxLength={6}
              />
            </div>

            <div className="mb-4">
              <Input
                type="password"
                label="Nova Senha"
                placeholder="Mín. 8 caracteres"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register('newPassword')}
              />
            </div>

            <div className="mb-4">
              <Input
                type="password"
                label="Confirmar Senha"
                placeholder="Repita a senha"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Definir Senha
            </Button>
          </form>
        )}

        <div className="mt-4 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-spark-primary hover:text-spark-primary-hover hover:underline">
            <ArrowLeft className="size-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
