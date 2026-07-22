import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import api from '../../lib/api';
import { PageHeader } from '../../components/custom';
import { Button, Input, Card, CardContent, Spinner } from '../../components/ui';
import { PrelineSelect } from '../../components/ui/preline-select';

const contractSchema = z.object({
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  company_id: z.string().min(1, 'Empresa é obrigatória'),
  contract_number: z.string().min(1, 'Número do contrato é obrigatório'),
  description: z.string().optional().or(z.literal('')),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().optional().or(z.literal('')),
  renewal_date: z.string().optional().or(z.literal('')),
  monthly_value: z.coerce.number().optional().default(0),
  hourly_value: z.coerce.number().optional().default(0),
  total_value: z.coerce.number().min(0, 'Valor total é obrigatório'),
  payment_terms: z.string().optional().or(z.literal('')),
  payment_day: z.coerce.number().optional().default(0),
  payment_method: z.string().optional().or(z.literal('')),
  billing_cycle: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ClientOption {
  id: string;
  name: string;
}

const companyOptions = [
  { value: 'id-spark', label: 'Spark' },
  { value: 'id-uniforce', label: 'Uniforce' },
  { value: 'id-cratos', label: 'Cratos' },
];

const billingCycleOptions = [
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'QUINZENAL', label: 'Quinzenal' },
  { value: 'SEMANAL', label: 'Semanal' },
];

export function ContractFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clientOptions, setClientOptions] = useState<{ value: string; label: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      monthly_value: 0,
      hourly_value: 0,
      total_value: 0,
      payment_day: 0,
    },
  });

  const fetchClients = async () => {
    try {
      const response = await api.get<{ data: ClientOption[] }>('/clients?limit=100');
      setClientOptions(response.data.data.map((c) => ({ value: c.id, label: c.name })));
    } catch {
      toast.error('Erro ao carregar clientes');
    }
  };

  useEffect(() => {
    fetchClients();
    if (isEditing) fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/contracts/${id}`);
      const c = response.data;
      reset({
        client_id: c.client_id,
        company_id: c.company_id,
        contract_number: c.contract_number,
        description: c.description || '',
        start_date: c.start_date?.split('T')[0] || '',
        end_date: c.end_date?.split('T')[0] || '',
        renewal_date: c.renewal_date?.split('T')[0] || '',
        monthly_value: c.monthly_value || 0,
        hourly_value: c.hourly_value || 0,
        total_value: c.total_value || 0,
        payment_terms: c.payment_terms || '',
        payment_day: c.payment_day || 0,
        payment_method: c.payment_method || '',
        billing_cycle: c.billing_cycle || '',
        notes: c.notes || '',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar contrato');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ContractFormData) => {
    try {
      setIsSaving(true);

      if (isEditing) {
        await api.put(`/contracts/${id}`, data);
        toast.success('Contrato atualizado com sucesso!');
      } else {
        await api.post('/contracts', data);
        toast.success('Contrato criado com sucesso!');
      }
      navigate('/contracts');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar contrato');
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
        title={isEditing ? 'Editar Contrato' : 'Novo Contrato'}
        subtitle={isEditing ? 'Atualize os dados do contrato' : 'Cadastre um novo contrato'}
        actions={
          <Button variant="ghost" onClick={() => navigate('/contracts')}>
            <ArrowLeft className="size-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                {/* Dados do Contrato */}
                <div>
                  <h3 className="text-sm font-medium dark:text-white text-spark-dark mb-4 flex items-center gap-2">
                    <FileText className="size-4" />
                    Dados do Contrato
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Número do Contrato *"
                      placeholder="EX-2024-001"
                      error={errors.contract_number?.message}
                      {...register('contract_number')}
                    />
                    <PrelineSelect
                      label="Cliente *"
                      options={clientOptions}
                      value={watch('client_id')}
                      onChange={(val) => setValue('client_id', val)}
                      placeholder="Selecione o cliente"
                      error={errors.client_id?.message}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <PrelineSelect
                      label="Empresa *"
                      options={companyOptions}
                      value={watch('company_id')}
                      onChange={(val) => setValue('company_id', val)}
                      placeholder="Selecione a empresa"
                      error={errors.company_id?.message}
                    />
                    <Input
                      label="Descrição"
                      placeholder="Descrição do contrato"
                      error={errors.description?.message}
                      {...register('description')}
                    />
                  </div>
                </div>

                {/* Vigência e Valores */}
                <div>
                  <h3 className="text-sm font-medium dark:text-white text-spark-dark mb-4">
                    Vigência e Valores
                  </h3>
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
                      label="Data de Renovação"
                      type="date"
                      error={errors.renewal_date?.message}
                      {...register('renewal_date')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <Input
                      label="Valor Mensal (R$)"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      error={errors.monthly_value?.message}
                      {...register('monthly_value')}
                    />
                    <Input
                      label="Valor Horário (R$)"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      error={errors.hourly_value?.message}
                      {...register('hourly_value')}
                    />
                    <Input
                      label="Valor Total (R$) *"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      error={errors.total_value?.message}
                      {...register('total_value')}
                    />
                  </div>
                </div>

                {/* Pagamento */}
                <div>
                  <h3 className="text-sm font-medium dark:text-white text-spark-dark mb-4">
                    Pagamento
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Condição de Pagamento"
                      placeholder="Ex: 30 dias após emissão"
                      error={errors.payment_terms?.message}
                      {...register('payment_terms')}
                    />
                    <Input
                      label="Dia de Pagamento"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Dia do mês"
                      error={errors.payment_day?.message}
                      {...register('payment_day')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <Input
                      label="Método de Pagamento"
                      placeholder="PIX, Boleto, Transferência..."
                      error={errors.payment_method?.message}
                      {...register('payment_method')}
                    />
                    <PrelineSelect
                      label="Ciclo de Faturamento"
                      options={billingCycleOptions}
                      value={watch('billing_cycle')}
                      onChange={(val) => setValue('billing_cycle', val)}
                      placeholder="Selecione..."
                    />
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <h3 className="text-sm font-medium dark:text-white text-spark-dark mb-4">
                    Observações
                  </h3>
                  <textarea
                    className="w-full rounded-lg border dark:border-spark-dark-border border-gray-300 bg-white dark:bg-spark-dark-card px-4 py-2.5 text-sm dark:text-white text-spark-dark placeholder:text-spark-gray dark:placeholder:text-spark-dark-text focus:border-spark-primary focus:ring-1 focus:ring-spark-primary outline-none"
                    rows={4}
                    placeholder="Observações adicionais sobre o contrato..."
                    {...register('notes')}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-spark-dark-border border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/contracts')}
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
