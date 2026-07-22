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

const asoSchema = z.object({
  employee_id: z.string().min(1, 'Colaborador é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  exam_date: z.string().min(1, 'Data do exame é obrigatória'),
  expiry_date: z.string().optional().or(z.literal('')),
  doctor_name: z.string().optional().or(z.literal('')),
  doctor_crm: z.string().optional().or(z.literal('')),
  clinic_name: z.string().optional().or(z.literal('')),
  result: z.string().min(1, 'Resultado é obrigatório'),
  restrictions: z.string().optional().or(z.literal('')),
  document_url: z.string().optional().or(z.literal('')),
  status: z.string().optional(),
});

type AsoFormData = z.infer<typeof asoSchema>;

interface Employee {
  id: string;
  full_name: string;
  registration_number: string;
  cpf: string;
}

const typeOptions = [
  { value: 'ADMISSIONAL', label: 'Admissional' },
  { value: 'DEMISSIONAL', label: 'Demissional' },
  { value: 'PERIODICO', label: 'Periódico' },
  { value: 'RETORNO_TRABALHO', label: 'Retorno ao Trabalho' },
  { value: 'MUDANCA_FUNCAO', label: 'Mudança de Função' },
];

const resultOptions = [
  { value: 'APTO', label: 'Apto' },
  { value: 'INAPTO', label: 'Inapto' },
];

const statusOptions = [
  { value: 'VALIDO', label: 'Válido' },
  { value: 'VENCIDO', label: 'Vencido' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export function AsoFormPage() {
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
  } = useForm<AsoFormData>({
    resolver: zodResolver(asoSchema),
    defaultValues: {
      type: '',
      exam_date: new Date().toISOString().split('T')[0],
      result: '',
      status: 'VALIDO',
    },
  });

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees?limit=100');
      setEmployees(response.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar colaboradores');
    }
  };

  useEffect(() => {
    fetchEmployees();
    if (isEditing) fetchAso();
  }, [id]);

  const fetchAso = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/asos/${id}`);
      const aso = response.data;
      reset({
        employee_id: aso.employee_id,
        type: aso.type,
        exam_date: aso.exam_date?.split('T')[0] || '',
        expiry_date: aso.expiry_date?.split('T')[0] || '',
        doctor_name: aso.doctor_name || '',
        doctor_crm: aso.doctor_crm || '',
        clinic_name: aso.clinic_name || '',
        result: aso.result,
        restrictions: aso.restrictions || '',
        document_url: aso.document_url || '',
        status: aso.status || 'VALIDO',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar ASO');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AsoFormData) => {
    try {
      setIsSaving(true);

      const payload = { ...data };

      if (isEditing) {
        await api.put(`/asos/${id}`, payload);
        toast.success('ASO atualizado com sucesso!');
      } else {
        await api.post('/asos', payload);
        toast.success('ASO criado com sucesso!');
      }
      navigate('/asos');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar ASO');
    } finally {
      setIsSaving(false);
    }
  };

  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.full_name} (${emp.registration_number})`,
  }));

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
        title={isEditing ? 'Editar ASO' : 'Novo ASO'}
        subtitle={isEditing ? 'Atualize os dados do ASO' : 'Cadastre um novo Atestado de Saúde Ocupacional'}
        actions={
          <Button variant="ghost" onClick={() => navigate('/asos')}>
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
                    label="Colaborador *"
                    options={employeeOptions}
                    value={watch('employee_id')}
                    onChange={(val) => setValue('employee_id', val)}
                    placeholder="Selecione o colaborador..."
                  />
                  <PrelineSelect
                    label="Tipo *"
                    options={typeOptions}
                    value={watch('type')}
                    onChange={(val) => setValue('type', val)}
                    placeholder="Selecione o tipo..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Data do Exame *"
                    type="date"
                    error={errors.exam_date?.message}
                    {...register('exam_date')}
                  />
                  <Input
                    label="Data de Validade"
                    type="date"
                    {...register('expiry_date')}
                  />
                  <PrelineSelect
                    label="Resultado *"
                    options={resultOptions}
                    value={watch('result')}
                    onChange={(val) => setValue('result', val)}
                    placeholder="Selecione o resultado..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Nome do Médico"
                    placeholder="Dr. João Silva"
                    {...register('doctor_name')}
                  />
                  <Input
                    label="CRM"
                    placeholder="CRM/ES 12345"
                    {...register('doctor_crm')}
                  />
                  <Input
                    label="Clínica"
                    placeholder="Nome da clínica"
                    {...register('clinic_name')}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PrelineSelect
                    label="Status"
                    options={statusOptions}
                    value={watch('status')}
                    onChange={(val) => setValue('status', val)}
                    placeholder="Selecione o status..."
                  />
                  <Input
                    label="URL do Documento"
                    placeholder="https://..."
                    {...register('document_url')}
                  />
                </div>
                <Input
                  label="Restrições"
                  placeholder="Observações ou restrições médicas"
                  {...register('restrictions')}
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-spark-dark-border border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/asos')}
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
