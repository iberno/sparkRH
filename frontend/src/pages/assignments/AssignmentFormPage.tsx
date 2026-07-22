import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import api from '../../lib/api';
import { PageHeader } from '../../components/custom';
import { Button, Input, Card, CardContent, Spinner, PrelineSelect } from '../../components/ui';

const assignmentSchema = z.object({
  employee_id: z.string().min(1, 'Colaborador é obrigatório'),
  post_id: z.string().min(1, 'Posto é obrigatório'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().optional().or(z.literal('')),
  shift: z.string().optional().or(z.literal('')),
  position: z.string().optional().or(z.literal('')),
  base_salary: z.string().optional().or(z.literal('')),
  additional: z.string().optional().or(z.literal('')),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface SelectOption {
  value: string;
  label: string;
}

export function AssignmentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([]);
  const [postOptions, setPostOptions] = useState<SelectOption[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchPosts()]);
    if (isEditing) fetchAssignment();
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get<{ data: { id: string; full_name: string; registration_number: string }[] }>('/employees?limit=100');
      setEmployeeOptions(response.data.data.map((e) => ({ value: e.id, label: `${e.full_name} (${e.registration_number})` })));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar colaboradores');
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get<{ data: { id: string; name: string; code: string | null }[] }>('/work-posts?limit=100');
      setPostOptions(response.data.data.map((p) => ({ value: p.id, label: p.code ? `${p.name} (${p.code})` : p.name })));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar postos');
    }
  };

  const fetchAssignment = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/assignments/${id}`);
      const a = response.data;
      reset({
        employee_id: a.employee_id,
        post_id: a.post_id,
        start_date: a.start_date?.split('T')[0] || '',
        end_date: a.end_date?.split('T')[0] || '',
        shift: a.shift || '',
        position: a.position || '',
        base_salary: a.base_salary != null ? String(a.base_salary) : '',
        additional: a.additional != null ? String(a.additional) : '',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar alocação');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      setIsSaving(true);

      const payload = {
        ...data,
        base_salary: data.base_salary ? parseFloat(data.base_salary) : null,
        additional: data.additional ? parseFloat(data.additional) : 0,
      };

      if (isEditing) {
        await api.put(`/assignments/${id}`, payload);
        toast.success('Alocação atualizada com sucesso!');
      } else {
        await api.post('/assignments', payload);
        toast.success('Alocação criada com sucesso!');
      }
      navigate('/assignments');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar alocação');
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
        title={isEditing ? 'Editar Alocação' : 'Nova Alocação'}
        subtitle={isEditing ? 'Atualize os dados da alocação' : 'Cadastre uma nova alocação de colaborador'}
        actions={
          <Button variant="ghost" onClick={() => navigate('/assignments')}>
            <ArrowLeft className="size-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-spark-dark-text text-spark-gray mb-1">Colaborador *</label>
                    <PrelineSelect
                      options={employeeOptions}
                      value={watch('employee_id')}
                      onChange={(val) => setValue('employee_id', val)}
                      placeholder="Selecione um colaborador..."
                    />
                    {errors.employee_id && <p className="text-sm text-red-500 mt-1">{errors.employee_id.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-spark-dark-text text-spark-gray mb-1">Posto *</label>
                    <PrelineSelect
                      options={postOptions}
                      value={watch('post_id')}
                      onChange={(val) => setValue('post_id', val)}
                      placeholder="Selecione um posto..."
                    />
                    {errors.post_id && <p className="text-sm text-red-500 mt-1">{errors.post_id.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Data de Início *"
                    type="date"
                    error={errors.start_date?.message}
                    {...register('start_date')}
                  />
                  <Input
                    label="Data de Fim"
                    type="date"
                    error={errors.end_date?.message}
                    {...register('end_date')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Escala"
                    placeholder="Ex: 12x36"
                    error={errors.shift?.message}
                    {...register('shift')}
                  />
                  <Input
                    label="Função"
                    placeholder="Função do colaborador"
                    error={errors.position?.message}
                    {...register('position')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Salário Base"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={errors.base_salary?.message}
                    {...register('base_salary')}
                  />
                  <Input
                    label="Adicional"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={errors.additional?.message}
                    {...register('additional')}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-spark-dark-border border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/assignments')}
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
