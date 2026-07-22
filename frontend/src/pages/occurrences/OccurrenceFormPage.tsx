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

const occurrenceSchema = z.object({
  employee_id: z.string().optional().or(z.literal('')),
  type: z.string().min(1, 'Tipo é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  occurrence_date: z.string().min(1, 'Data é obrigatória'),
  severity: z.string().optional().or(z.literal('')),
  actions_taken: z.string().optional().or(z.literal('')),
});

type OccurrenceFormData = z.infer<typeof occurrenceSchema>;

const typeOptions = [
  { value: 'ROUBO', label: 'Roubo' },
  { value: 'INCENDIO', label: 'Incêndio' },
  { value: 'INVASAO', label: 'Invasão' },
  { value: 'VAZAMENTO', label: 'Vazamento' },
  { value: 'ELETRICIDADE', label: 'Elétrico' },
  { value: 'ACIDENTE', label: 'Acidente' },
  { value: 'AVARIA', label: 'Avaria' },
  { value: 'OUTROS', label: 'Outros' },
];

const severityOptions = [
  { value: 'CRITICA', label: 'Crítica' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'BAIXA', label: 'Baixa' },
];

interface EmployeeOption {
  id: string;
  full_name: string;
}

export function OccurrenceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<OccurrenceFormData>({
    resolver: zodResolver(occurrenceSchema),
    defaultValues: {
      occurrence_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    fetchEmployees();
    if (isEditing) fetchOccurrence();
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees?limit=100');
      setEmployees(response.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar colaboradores');
    }
  };

  const fetchOccurrence = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/occurrences/${id}`);
      const occ = response.data;
      reset({
        employee_id: occ.employee?.id || '',
        type: occ.type,
        description: occ.description,
        occurrence_date: occ.occurrence_date?.split('T')[0] || '',
        severity: occ.severity || '',
        actions_taken: occ.actions_taken || '',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar ocorrência');
    } finally {
      setIsLoading(false);
    }
  };

  const employeeOptions = [
    { value: '', label: 'Nenhum colaborador' },
    ...employees.map((emp) => ({ value: emp.id, label: emp.full_name })),
  ];

  const onSubmit = async (data: OccurrenceFormData) => {
    try {
      setIsSaving(true);

      const payload = {
        ...data,
        employee_id: data.employee_id || null,
        severity: data.severity || null,
        actions_taken: data.actions_taken || null,
        registered_by: '00000000-0000-0000-0000-000000000000',
      };

      if (isEditing) {
        await api.put(`/occurrences/${id}`, payload);
        toast.success('Ocorrência atualizada com sucesso!');
      } else {
        await api.post('/occurrences', payload);
        toast.success('Ocorrência registrada com sucesso!');
      }
      navigate('/occurrences');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar ocorrência');
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
        title={isEditing ? 'Editar Ocorrência' : 'Nova Ocorrência'}
        subtitle={isEditing ? 'Atualize os dados da ocorrência' : 'Registre uma nova ocorrência'}
        actions={
          <Button variant="ghost" onClick={() => navigate('/occurrences')}>
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
                  <PrelineSelect
                    label="Tipo *"
                    options={typeOptions}
                    value={watch('type')}
                    onChange={(val) => setValue('type', val)}
                    placeholder="Selecione o tipo"
                  />
                  <PrelineSelect
                    label="Severidade"
                    options={severityOptions}
                    value={watch('severity')}
                    onChange={(val) => setValue('severity', val)}
                    placeholder="Selecione a severidade"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Data da Ocorrência *"
                    type="date"
                    error={errors.occurrence_date?.message}
                    {...register('occurrence_date')}
                  />
                  <PrelineSelect
                    label="Colaborador"
                    options={employeeOptions}
                    value={watch('employee_id')}
                    onChange={(val) => setValue('employee_id', val)}
                    placeholder="Nenhum colaborador"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium dark:text-spark-dark-text text-spark-dark">
                    Descrição *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Descreva a ocorrência..."
                    className={`py-2.5 px-4 block w-full border rounded-lg text-sm transition-colors focus:border-spark-primary focus:ring-spark-primary disabled:opacity-50 disabled:pointer-events-none dark:bg-spark-dark-bg dark:text-spark-dark-text bg-gray-50 text-spark-dark ${
                      errors.description
                        ? 'dark:border-red-500/50 border-red-500'
                        : 'dark:border-spark-dark-border border-gray-200'
                    }`}
                    {...register('description')}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium dark:text-spark-dark-text text-spark-dark">
                    Ações Tomadas
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descreva as ações tomadas (opcional)..."
                    className="py-2.5 px-4 block w-full border rounded-lg text-sm transition-colors focus:border-spark-primary focus:ring-spark-primary disabled:opacity-50 disabled:pointer-events-none dark:bg-spark-dark-bg dark:text-spark-dark-text bg-gray-50 text-spark-dark dark:border-spark-dark-border border-gray-200"
                    {...register('actions_taken')}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-spark-dark-border border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/occurrences')}
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  <Save className="size-4 mr-2" />
                  {isEditing ? 'Atualizar' : 'Registrar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
