import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft, Building2, Phone, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import api from '../../lib/api';
import { PageHeader } from '../../components/custom';
import { Button, Input, Card, CardContent, Spinner } from '../../components/ui';
import { PrelineSelect } from '../../components/ui/preline-select';

const clientSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  type: z.string().default('JURIDICA'),
  cnpj_cpf: z.string().min(11, 'CNPJ/CPF é obrigatório'),
  contact_name: z.string().optional().or(z.literal('')),
  contact_phone: z.string().optional().or(z.literal('')),
  contact_email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
});

type ClientFormData = z.infer<typeof clientSchema>;

const typeOptions = [
  { value: 'JURIDICA', label: 'Pessoa Jurídica' },
  { value: 'FISICA', label: 'Pessoa Física' },
];

const stateOptions = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export function ClientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: 'JURIDICA',
    },
  });

  useEffect(() => {
    if (isEditing) fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/clients/${id}`);
      const client = response.data;
      reset({
        name: client.name,
        type: client.type,
        cnpj_cpf: client.cnpj_cpf,
        contact_name: client.contact_name || '',
        contact_phone: client.contact_phone || '',
        contact_email: client.contact_email || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsSaving(true);

      const payload = {
        ...data,
        cnpj_cpf: data.cnpj_cpf.replace(/\D/g, ''),
        contact_phone: data.contact_phone?.replace(/\D/g, ''),
      };

      if (isEditing) {
        await api.put(`/clients/${id}`, payload);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await api.post('/clients', payload);
        toast.success('Cliente criado com sucesso!');
      }
      navigate('/clients');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar cliente');
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
        title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        subtitle={isEditing ? 'Atualize os dados do cliente' : 'Cadastre um novo cliente'}
        actions={
          <Button variant="ghost" onClick={() => navigate('/clients')}>
            <ArrowLeft className="size-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Dados Gerais */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="size-4 text-spark-primary" />
                  <h3 className="text-sm font-semibold dark:text-white text-spark-dark">Dados Gerais</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nome *"
                      placeholder="Razão social ou nome completo"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <PrelineSelect
                      label="Tipo *"
                      options={typeOptions}
                      value={watch('type')}
                      onChange={(val) => setValue('type', val)}
                      placeholder="Selecione o tipo"
                    />
                  </div>
                  <Input
                    label={watch('type') === 'JURIDICA' ? 'CNPJ *' : 'CPF *'}
                    placeholder={watch('type') === 'JURIDICA' ? '00.000.000/0000-00' : '000.000.000-00'}
                    error={errors.cnpj_cpf?.message}
                    {...register('cnpj_cpf')}
                  />
                </div>
              </div>

              {/* Contato */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="size-4 text-spark-primary" />
                  <h3 className="text-sm font-semibold dark:text-white text-spark-dark">Contato</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nome do Contato"
                      placeholder="Nome da pessoa de contato"
                      error={errors.contact_name?.message}
                      {...register('contact_name')}
                    />
                    <Input
                      label="Telefone"
                      placeholder="(27) 99999-0000"
                      error={errors.contact_phone?.message}
                      {...register('contact_phone')}
                    />
                  </div>
                  <Input
                    label="E-mail"
                    type="email"
                    placeholder="contato@empresa.com"
                    error={errors.contact_email?.message}
                    {...register('contact_email')}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="size-4 text-spark-primary" />
                  <h3 className="text-sm font-semibold dark:text-white text-spark-dark">Endereço</h3>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Endereço"
                    placeholder="Rua, Avenida, etc."
                    error={errors.address?.message}
                    {...register('address')}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Cidade"
                      placeholder="Cidade"
                      error={errors.city?.message}
                      {...register('city')}
                    />
                    <PrelineSelect
                      label="Estado"
                      options={stateOptions}
                      value={watch('state')}
                      onChange={(val) => setValue('state', val)}
                      placeholder="Selecione o estado"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t dark:border-spark-dark-border border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/clients')}
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
