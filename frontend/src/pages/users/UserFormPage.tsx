import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import { ROLES } from '../../lib/constants';
import { PageHeader } from '../../components/custom';
import { Button, Input, Card, CardContent, Alert, Spinner } from '../../components/ui';
import { z } from 'zod';

const userSchema = z.object({
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').optional().or(z.literal('')),
  role: z.string().min(1, 'Perfil é obrigatório'),
  employeeId: z.string().optional().or(z.literal('')),
});

type UserFormData = z.infer<typeof userSchema>;

interface Employee {
  id: string;
  full_name: string;
  registration_number: string;
  cpf: string;
}

export function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [employees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'EMPLOYEE',
    },
  });

  useEffect(() => {
    fetchEmployees();
    if (isEditing) {
      fetchUser();
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      // TODO: Create employees endpoint
      // const response = await api.get('/employees?hasUser=false');
      // setEmployees(response.data.data);
    } catch (err) {
      // Silently fail for now
    }
  };

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/users/${id}`);
      const user = response.data;
      reset({
        cpf: user.cpf,
        email: user.email || '',
        role: user.role,
        employeeId: user.employee_id || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        cpf: data.cpf.replace(/\D/g, ''),
        email: data.email || undefined,
        password: data.password || undefined,
        role: data.role,
        employeeId: data.employeeId || undefined,
      };

      if (isEditing) {
        await api.put(`/users/${id}`, payload);
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        await api.post('/users', payload);
        setSuccess('Usuário criado com sucesso!');
        setTimeout(() => navigate('/users'), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar usuário');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar Usuário' : 'Novo Usuário'}
        subtitle={isEditing ? 'Atualize os dados do usuário' : 'Crie um novo usuário no sistema'}
        actions={
          <Button variant="ghost" onClick={() => navigate('/users')}>
            <ArrowLeft className="size-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            {success && <Alert variant="success" className="mb-4">{success}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Input
                    label="CPF"
                    placeholder="000.000.000-00"
                    error={errors.cpf?.message}
                    {...register('cpf')}
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    label="E-mail (opcional)"
                    placeholder="email@exemplo.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
              </div>

              {!isEditing && (
                <div className="mb-4">
                  <Input
                    type="password"
                    label="Senha"
                    placeholder="Mín. 8 caracteres"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium dark:text-white text-spark-dark mb-1">
                    Perfil
                  </label>
                  <select
                    {...register('role')}
                    className="w-full h-[38px] px-3 py-2 text-sm dark:bg-spark-dark-bg bg-gray-50 dark:text-spark-dark-text text-spark-dark dark:border-spark-dark-border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spark-primary"
                  >
                    {Object.entries(ROLES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-white text-spark-dark mb-1">
                    Colaborador (opcional)
                  </label>
                  <select
                    {...register('employeeId')}
                    className="w-full h-[38px] px-3 py-2 text-sm dark:bg-spark-dark-bg bg-gray-50 dark:text-spark-dark-text text-spark-dark dark:border-spark-dark-border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spark-primary"
                  >
                    <option value="">Nenhum</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.registration_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/users')}
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  <Save className="size-4 mr-2" />
                  {isEditing ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
