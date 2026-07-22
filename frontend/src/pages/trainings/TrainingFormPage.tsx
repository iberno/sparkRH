import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import api from '../../lib/api';
import { PageHeader } from '../../components/custom';
import { Button, Input, Card, CardContent, Spinner } from '../../components/ui';
import { PrelineSelect } from '../../components/ui/preline-select';

const trainingSchema = z.object({
  employee_id: z.string().min(1, 'Colaborador é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  provider: z.string().optional().or(z.literal('')),
  workload: z.string().optional().or(z.literal('')),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().optional().or(z.literal('')),
  expiry_date: z.string().optional().or(z.literal('')),
  certificate_number: z.string().optional().or(z.literal('')),
  status: z.string().optional(),
});

type TrainingFormData = z.infer<typeof trainingSchema>;

interface Employee {
  id: string;
  full_name: string;
  registration_number: string;
}

const CATEGORY_OPTIONS = [
  { value: 'NR_10', label: 'NR-10' },
  { value: 'NR_12', label: 'NR-12' },
  { value: 'NR_20', label: 'NR-20' },
  { value: 'NR_35', label: 'NR-35' },
  { value: 'DEFESA_PESSOAL', label: 'Defesa Pessoal' },
  { value: 'PRIMEIROS_SOCORROS', label: 'Primeiros Socorros' },
  { value: 'MANIPULACAO_EXTINTORES', label: 'Extintores' },
  { value: 'CFTV_MONITORAMENTO', label: 'CFTV' },
  { value: 'RECICLAGEM_SENAI', label: 'SENAI' },
  { value: 'OUTROS', label: 'Outros' },
];

const STATUS_OPTIONS = [
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'VENCIDO', label: 'Vencido' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export function TrainingFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      start_date: new Date().toISOString().split('T')[0],
      status: 'EM_ANDAMENTO',
    },
  });

  useEffect(() => {
    fetchEmployees();
    if (isEditing) fetchTraining();
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get<{ data: Employee[] }>('/employees?limit=100');
      setEmployees(response.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar colaboradores');
    }
  };

  const fetchTraining = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/trainings/${id}`);
      const t = response.data;
      reset({
        employee_id: t.employee_id,
        name: t.name,
        category: t.category,
        provider: t.provider || '',
        workload: t.workload?.toString() || '',
        start_date: t.start_date?.split('T')[0] || '',
        end_date: t.end_date?.split('T')[0] || '',
        expiry_date: t.expiry_date?.split('T')[0] || '',
        certificate_number: t.certificate_number || '',
        status: t.status || 'EM_ANDAMENTO',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar treinamento');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TrainingFormData) => {
    try {
      setIsSaving(true);

      const payload = {
        ...data,
        workload: data.workload ? Number(data.workload) : null,
        provider: data.provider || null,
        end_date: data.end_date || null,
        expiry_date: data.expiry_date || null,
        certificate_number: data.certificate_number || null,
      };

      if (isEditing) {
        await api.put(`/trainings/${id}`, payload);
        toast.success('Treinamento atualizado com sucesso!');
      } else {
        await api.post('/trainings', payload);
        toast.success('Treinamento criado com sucesso!');
      }
      navigate('/trainings');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar treinamento');
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

  const employeeOptions = [
    { value: '', label: 'Selecione um colaborador...' },
    ...employees.map((e) => ({ value: e.id, label: `${e.full_name} (${e.registration_number})` })),
  ];

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar Treinamento' : 'Novo Treinamento'}
        subtitle={isEditing ? 'Atualize os dados do treinamento' : 'Cadastre um novo treinamento'}
        actions={
          <Button variant="ghost" onClick={() => navigate('/trainings')}>
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
                <PrelineSelect
                  label="Colaborador *"
                  options={employeeOptions}
                  value={watch('employee_id')}
                  onChange={(val) => setValue('employee_id', val)}
                  placeholder="Selecione um colaborador..."
                />
                {errors.employee_id && (
                  <p className="text-sm text-red-500">{errors.employee_id.message}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome do Treinamento *"
                    placeholder="Ex: NR-10 Básico"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <PrelineSelect
                    label="Categoria *"
                    options={CATEGORY_OPTIONS}
                    value={watch('category')}
                    onChange={(val) => setValue('category', val)}
                    placeholder="Selecione..."
                  />
                </div>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Fornecedor"
                    placeholder="Nome do fornecedor"
                    error={errors.provider?.message}
                    {...register('provider')}
                  />
                  <Input
                    label="Carga Horária (horas)"
                    type="number"
                    placeholder="Ex: 40"
                    error={errors.workload?.message}
                    {...register('workload')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Data de Início *"
                    type="date"
                    error={errors.start_date?.message}
                    {...register('start_date')}
                  />
                  <Input
                    label="Data de Término"
                    type="date"
                    error={errors.end_date?.message}
                    {...register('end_date')}
                  />
                  <Input
                    label="Data de Validade"
                    type="date"
                    error={errors.expiry_date?.message}
                    {...register('expiry_date')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Número do Certificado"
                    placeholder="Nº do certificado"
                    error={errors.certificate_number?.message}
                    {...register('certificate_number')}
                  />
                  <PrelineSelect
                    label="Status"
                    options={STATUS_OPTIONS}
                    value={watch('status')}
                    onChange={(val) => setValue('status', val)}
                    placeholder="Selecione..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-spark-dark-border border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/trainings')}
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
