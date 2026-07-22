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

const driverSchema = z.object({
  employee_id: z.string().min(1, 'Colaborador é obrigatório'),
  cnh_number: z.string().min(11, 'CNH deve ter 11 dígitos'),
  cnh_category: z.string().min(1, 'Categoria é obrigatória'),
  cnh_expiry: z.string().min(1, 'Validade da CNH é obrigatória'),
  cfc_name: z.string().optional().or(z.literal('')),
  cfc_validity: z.string().optional().or(z.literal('')),
  status: z.string().optional(),
});

type DriverFormData = z.infer<typeof driverSchema>;

const statusOptions = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'INATIVO', label: 'Inativo' },
];

const cnhCategoryOptions = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'AB', label: 'AB' },
  { value: 'AC', label: 'AC' },
  { value: 'AD', label: 'AD' },
  { value: 'AE', label: 'AE' },
];

interface EmployeeOption {
  id: string;
  full_name: string;
  registration_number: string;
}

export function DriverFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<{ value: string; label: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      status: 'ATIVO',
    },
  });

  useEffect(() => {
    fetchEmployees();
    if (isEditing) fetchDriver();
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get<{ data: EmployeeOption[] }>('/employees?limit=100');
      setEmployeeOptions(
        response.data.data.map((e) => ({
          value: e.id,
          label: `${e.full_name} (${e.registration_number})`,
        }))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar colaboradores');
    }
  };

  const fetchDriver = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/drivers/${id}`);
      const d = response.data;
      reset({
        employee_id: d.employee_id,
        cnh_number: d.cnh_number,
        cnh_category: d.cnh_category,
        cnh_expiry: d.cnh_expiry?.split('T')[0] || '',
        cfc_name: d.cfc_name || '',
        cfc_validity: d.cfc_validity?.split('T')[0] || '',
        status: d.status,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar motorista');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: DriverFormData) => {
    try {
      setIsSaving(true);

      const payload = {
        ...data,
        cnh_number: data.cnh_number.replace(/\D/g, ''),
      };

      if (isEditing) {
        await api.put(`/drivers/${id}`, payload);
        toast.success('Motorista atualizado com sucesso!');
        navigate('/drivers');
      } else {
        const response = await api.post('/drivers', payload);
        toast.success('Motorista criado com sucesso!');
        navigate(`/drivers/${response.data.id}/edit`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar motorista');
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
        title={isEditing ? 'Editar Motorista' : 'Novo Motorista'}
        subtitle={isEditing ? 'Atualize os dados do motorista' : 'Cadastre um novo motorista'}
        actions={
          <Button variant="ghost" onClick={() => navigate('/drivers')}>
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
                    placeholder="Selecione um colaborador..."
                  />
                  <Input
                    label="Número da CNH *"
                    placeholder="00000000000"
                    error={errors.cnh_number?.message}
                    {...register('cnh_number')}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <PrelineSelect
                    label="Categoria CNH *"
                    options={cnhCategoryOptions}
                    value={watch('cnh_category')}
                    onChange={(val) => setValue('cnh_category', val)}
                    placeholder="Selecione..."
                  />
                  <Input
                    label="Validade da CNH *"
                    type="date"
                    error={errors.cnh_expiry?.message}
                    {...register('cnh_expiry')}
                  />
                  <PrelineSelect
                    label="Status"
                    options={statusOptions}
                    value={watch('status')}
                    onChange={(val) => setValue('status', val)}
                    placeholder="Selecione..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome do CFC"
                    placeholder="Centro de Formação de Condutores"
                    error={errors.cfc_name?.message}
                    {...register('cfc_name')}
                  />
                  <Input
                    label="Validade do CFC"
                    type="date"
                    error={errors.cfc_validity?.message}
                    {...register('cfc_validity')}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-spark-dark-border border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/drivers')}
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
