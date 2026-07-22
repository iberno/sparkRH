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

const workPostSchema = z.object({
  contract_id: z.string().min(1, 'Contrato é obrigatório'),
  code: z.string().min(1, 'Código é obrigatório'),
  name: z.string().min(2, 'Nome é obrigatório'),
  post_type: z.string().min(1, 'Tipo do posto é obrigatório'),
  description: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  gps_radius: z.coerce.number().optional().nullable(),
  schedule_type: z.string().optional().or(z.literal('')),
  min_staff: z.coerce.number().optional().nullable(),
  max_staff: z.coerce.number().optional().nullable(),
  required_vacancies: z.coerce.number().optional().nullable(),
});

type WorkPostFormData = z.infer<typeof workPostSchema>;

const POST_TYPE_OPTIONS = [
  { value: 'VIGILANCIA', label: 'Vigilância' },
  { value: 'PORTARIA', label: 'Portaria' },
  { value: 'RONDA', label: 'Ronda' },
  { value: 'MONITORAMENTO', label: 'Monitoramento' },
  { value: 'LIMPEZA', label: 'Limpeza' },
  { value: 'JARDINAGEM', label: 'Jardinagem' },
  { value: 'INSPECAO', label: 'Inspeção' },
  { value: 'FISCAL_LOJA', label: 'Fiscal de Loja' },
];

const SCHEDULE_TYPE_OPTIONS = [
  { value: 'FIXO', label: 'Fixo' },
  { value: 'ROTATIVO', label: 'Rotativo' },
  { value: 'MISTO', label: 'Misto' },
];

interface Contract {
  id: string;
  contract_number: string;
  client: {
    name: string;
  };
}

export function WorkPostFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<WorkPostFormData>({
    resolver: zodResolver(workPostSchema),
  });

  useEffect(() => {
    fetchContracts();
    if (isEditing) fetchWorkPost();
  }, [id]);

  const fetchContracts = async () => {
    try {
      const response = await api.get<{ data: Contract[] }>('/contracts?status=ATIVO&limit=100');
      setContracts(response.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar contratos');
    }
  };

  const fetchWorkPost = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/work-posts/${id}`);
      const wp = response.data;
      reset({
        contract_id: wp.contract_id || wp.contract?.id || '',
        code: wp.code || '',
        name: wp.name || '',
        post_type: wp.post_type || '',
        description: wp.description || '',
        address: wp.address || '',
        city: wp.city || '',
        state: wp.state || '',
        latitude: wp.latitude ?? null,
        longitude: wp.longitude ?? null,
        gps_radius: wp.gps_radius ?? null,
        schedule_type: wp.schedule_type || '',
        min_staff: wp.min_staff ?? null,
        max_staff: wp.max_staff ?? null,
        required_vacancies: wp.required_vacancies ?? null,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar posto de trabalho');
    } finally {
      setIsLoading(false);
    }
  };

  const contractOptions = contracts.map((c) => ({
    value: c.id,
    label: `${c.contract_number} - ${c.client.name}`,
  }));

  const onSubmit = async (data: WorkPostFormData) => {
    try {
      setIsSaving(true);

      if (isEditing) {
        await api.put(`/work-posts/${id}`, data);
        toast.success('Posto atualizado com sucesso!');
      } else {
        await api.post('/work-posts', data);
        toast.success('Posto criado com sucesso!');
      }
      navigate('/work-posts');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar posto de trabalho');
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
        title={isEditing ? 'Editar Posto de Trabalho' : 'Novo Posto de Trabalho'}
        subtitle={isEditing ? 'Atualize os dados do posto' : 'Cadastre um novo posto de trabalho'}
        actions={
          <Button variant="ghost" onClick={() => navigate('/work-posts')}>
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
                    label="Contrato *"
                    options={contractOptions}
                    value={watch('contract_id')}
                    onChange={(val) => setValue('contract_id', val)}
                    placeholder="Selecione o contrato"
                    hasSearch
                    error={errors.contract_id?.message}
                  />
                  <Input
                    label="Código *"
                    placeholder="Ex: POSTO-001"
                    error={errors.code?.message}
                    {...register('code')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome *"
                    placeholder="Nome do posto"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <PrelineSelect
                    label="Tipo do Posto *"
                    options={POST_TYPE_OPTIONS}
                    value={watch('post_type')}
                    onChange={(val) => setValue('post_type', val)}
                    placeholder="Selecione o tipo"
                    error={errors.post_type?.message}
                  />
                </div>

                <Input
                  label="Descrição"
                  placeholder="Descrição do posto (opcional)"
                  {...register('description')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PrelineSelect
                    label="Escala"
                    options={SCHEDULE_TYPE_OPTIONS}
                    value={watch('schedule_type')}
                    onChange={(val) => setValue('schedule_type', val)}
                    placeholder="Selecione a escala"
                  />
                  <Input
                    label="Vagas Necessárias"
                    type="number"
                    placeholder="0"
                    error={errors.required_vacancies?.message}
                    {...register('required_vacancies')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Mín. de Colaboradores"
                    type="number"
                    placeholder="0"
                    error={errors.min_staff?.message}
                    {...register('min_staff')}
                  />
                  <Input
                    label="Máx. de Colaboradores"
                    type="number"
                    placeholder="0"
                    error={errors.max_staff?.message}
                    {...register('max_staff')}
                  />
                </div>

                <div className="border-t dark:border-spark-dark-border border-gray-200 pt-6 mt-6">
                  <h3 className="text-sm font-semibold dark:text-white text-spark-dark mb-4">Localização</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Endereço"
                      placeholder="Endereço completo"
                      {...register('address')}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Cidade"
                        placeholder="Cidade"
                        {...register('city')}
                      />
                      <Input
                        label="UF"
                        placeholder="ES"
                        maxLength={2}
                        {...register('state')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <Input
                      label="Latitude"
                      type="number"
                      step="any"
                      placeholder="-20.3155"
                      error={errors.latitude?.message}
                      {...register('latitude')}
                    />
                    <Input
                      label="Longitude"
                      type="number"
                      step="any"
                      placeholder="-40.3128"
                      error={errors.longitude?.message}
                      {...register('longitude')}
                    />
                    <Input
                      label="Raio GPS (m)"
                      type="number"
                      placeholder="100"
                      error={errors.gps_radius?.message}
                      {...register('gps_radius')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-spark-dark-border border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/work-posts')}
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
